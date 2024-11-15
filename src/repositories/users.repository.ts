import { compare, hash } from 'bcrypt';
import { EntityRepository } from 'typeorm';
import { CreateUserDto, UpdateUserDto } from '@dtos/users.dto';
import { UserEntity } from '@entities/users.entity';
import { HttpException } from '@exceptions/httpException';
import { ResetStatus, User, UserWithMeta } from '@interfaces/users.interface';
import { ProfileEntity } from '@/entities/profile.entity';
import { RoleEntity } from '@/entities/role.entity';
import { Role } from '@/interfaces/role.interface';
import { FollowEntity } from '@/entities/follow.entity';
import { Community } from '@/interfaces/community.interface';
import { CommunityMemberEntity } from '@/entities/communityMember.entity';
import { ListingEntity } from '@/entities/listing.entity';
import { PointRepository } from './point.repository';
import { generateToken } from '@/utils/generateToken';
import { parseIntStrict } from '@/utils/parseIntStrict';
import { SitemapLists } from '@/typedefs/listing.type';

@EntityRepository(UserEntity)
export class UserRepository {
  public checkIfUsernameValid(username) {
  
      if (username.length < 5) {
          return { isValid: false, message: "Username must be at least 5 characters long." };
      }

      // Special characters check
      const specialCharPattern = /[^a-zA-Z0-9]/;
      if (specialCharPattern.test(username)) {
          return { isValid: false, message: "Username should not contain special characters." };
      }

      // Blacklisted words check
      const blacklistedWords = ["facebook", "amazon", "google", "admin", "support"];
      const containsBlacklistedWord = blacklistedWords.some(word => username.toLowerCase().includes(word));

      if (containsBlacklistedWord) {
          return { isValid: false, message: "Username contains a blacklisted word." };
      }

      // If all checks pass
      return { isValid: true, message: "Username is valid." };
  }

  public async userFollowerStatus(sellerId:number, userId:number|null){
    if (!userId) return false;
    const followEntity = await FollowEntity.find({where: {
      userId: userId,
      followedUserId: sellerId,
      isDeleted: false
    }})
    console.log("follow", followEntity);
    if (followEntity.length > 0) return true;
    return false;
  }

  public async sellerSitemapList(): Promise<SitemapLists> {
    const users = await UserEntity.find({
      where: {
        isDeleted: false,
        isEmailVerified: true,
    }})
    
    const sitemaps = users.map((user) => {
      return {
        url: `${process.env.SITEMAP_BASE_URL}/sellers/${user.username}`,
        lastmod: user.createdAt,
        changefreq: "daily",
        priority: 0.8
      }
    })

    
    return {items: sitemaps}
  }

  public async userList(): Promise<UserWithMeta[]> {
    const users: User[]= await UserEntity.createQueryBuilder("user")
                                .leftJoinAndSelect("user.profile", "profile")
                                .leftJoinAndSelect("user.roles", "roles")
                                .getMany();

    const userIds: number[] = users.map((user) => user.id)

    const followingCounts = await FollowEntity
            .createQueryBuilder('f')
            .select('f.userId', 'userId')
            .addSelect('COUNT(f.id)', 'followingCount')
            .where('f.userId IN (:...userIds)', { userIds })
            .groupBy('f.userId')
            .getRawMany();

    const followerCounts = await FollowEntity
            .createQueryBuilder('f')
            .select('f.followedUserId', 'followedUserId')
            .addSelect('COUNT(f.id)', 'followerCount')
            .where('f.followedUserId IN (:...userIds)', { userIds })
            .groupBy('f.followedUserId')
            .getRawMany();

    const listingCounts = await ListingEntity
          .createQueryBuilder('li')
          .select('li.userId', 'userId')
          .addSelect('COUNT(li.id)', 'listingCount')
          .where('li.userId IN (:...userIds)', { userIds })
          .groupBy('li.userId')
          .getRawMany();

    const communities = await CommunityMemberEntity.createQueryBuilder('cm')
                              .select("cm.id")
                              .leftJoinAndSelect('cm.user', 'user')
                              .leftJoinAndSelect('cm.community', 'community')
                              .where('cm.userId In (:...userIds)', { userIds })
                              .getMany();

    const balances = await new PointRepository().pointBalanceQueries(userIds)

    const returningUsers: UserWithMeta[] = users.map((user) =>  {
      const followingCount = followingCounts.find(fe => fe.userId === user.id)?.followingCount
      const followerCount = followerCounts.find(fe => fe.followedUserId === user.id)?.followerCount
      const listingCount = listingCounts.find(li => li.userId === user.id)?.listingCount
      const balance = balances[user.id]
      return {
        ...user ,
        followerCount : followerCount? followerCount : 0 ,
        followingCount : followingCount? followingCount : 0,
        listingCount : listingCount? listingCount : 0,
        communities : communities.filter(item => item.user.id == user.id).map(item => item.community),
        pointBalance: balance ? balance : 0
      }
    })

    return returningUsers;
  }

  public async userFindById(userId: string, currentUser: any): Promise<UserWithMeta> {
    var user;
    try {
      user = await UserEntity.findOne({ where: { id: parseIntStrict(userId)  }, relations: ['profile', 'roles']});
    } catch (error) {
      user = await UserEntity.findOne({ where: { username: userId  }, relations: ['profile', 'roles']});
      
    }
    if (!user) throw new HttpException(409, "User doesn't exist");
    const followerCount:number = await FollowEntity.count({where: {followedUser: user}})
    const followingCount:number = await FollowEntity.count({where: {user: user}})
    const communities: Community[] = await CommunityMemberEntity.find({
                    where: {user: user},
                    relations: ["community"]
                  })
    const listingCount: number = await ListingEntity.count({where: {user: user}})
    const pointBalance: number = await new PointRepository().pointBalanceQuery(user.id)
    var followingStatus = false;
    if (currentUser){
      followingStatus = await this.userFollowerStatus(user.id, currentUser);
    } 
    return {...user, followerCount, followingCount, communities, listingCount, pointBalance, followingStatus };
  }

  
  public async userCreate(userData: CreateUserDto): Promise<User> {
    const findUser: User = await UserEntity.findOne({ where: { email: userData.email } });
    if (findUser) throw new HttpException(409, `This email ${userData.email} already exists`);
    
    const checkUsername = this.checkIfUsernameValid(userData.username)
    if (!checkUsername.isValid){
        throw new HttpException(409, checkUsername.message);
    }
    const findUserUsername: User = await UserEntity.findOne({ where: { username: userData.username } });
    if (findUserUsername) throw new HttpException(409, `This username ${userData.username} already exists`);

    const hashedPassword = await hash(userData.password, 10);
    
    const createUserData: User = await UserEntity.create({
      ...userData, 
      password: hashedPassword, 
      profile: new ProfileEntity(), 

    }).save();

    return createUserData;
  }


  public async userUpdate(currentUser: number|any, userId: number, userData: UpdateUserDto): Promise<User> {
    if (!currentUser){
      throw new HttpException(409, "operation not permitted")
    }
    const findUser: User = await UserEntity.findOne({ where: { id: userId } });
    if (!findUser) throw new HttpException(409, "User doesn't exist");
    if (currentUser != findUser.id){
      throw new HttpException(409, "operation not permitted")
    }

    if (userData.password){
      if (!!userData.oldPassword){
        const isPasswordMatching: boolean = await compare(userData.oldPassword, findUser.password);
        if (!isPasswordMatching) throw new HttpException(409, "Couldn't verify the old password");
      }
      const hashedPassword = await hash(userData.password, 10);
      await UserEntity.update(userId, { password: hashedPassword });
    }

    const to_update = {}
    if (userData.username){
      const checkUsername = this.checkIfUsernameValid(userData.username)
      if (!checkUsername.isValid){
          throw new HttpException(409, checkUsername.message);
      }
      const findUser: User = await UserEntity.findOne({ where: { username: userData.username } });
      if (findUser) throw new HttpException(409, `This username ${userData.username} already exists`);
      to_update["username"]= userData.username 
    } 
    console.log("to_update", to_update)
    if (!!to_update){
      await UserEntity.update(userId,  to_update)
      const updateUser: User = await UserEntity.findOne({ where: { id: userId } });
      return updateUser;
    }
    return findUser;
    
  }

  public async userRoleUpdate(userId:number, roleId: number): Promise<User> {
    const findUser: UserEntity = await UserEntity.findOne({ where: { id: userId }, relations: ['roles'] });
    if (!findUser) throw new HttpException(409, "User doesn't exist");

    const findRole:RoleEntity = await RoleEntity.findOne({ where: { id: roleId } });
    if (!findRole) throw new HttpException(409, "Role doesn't exist");
    console.log("roles", findUser.roles)

    //check if role already exists in user roles
    const roleExists = findUser.roles.find(role => role.id === roleId);
    if (roleExists) throw new HttpException(409, "Role already exists");


    findUser.roles =  [...findUser.roles, findRole];

    await findUser.save();

    const updateUser: User = await UserEntity.findOne({ where: { id: userId }, relations: ['roles'] });
    return updateUser;
  }

  public async userRoleRemove(userId:number, roleId: number): Promise<User> {
    const findUser: UserEntity = await UserEntity.findOne({ where: { id: userId }, relations: ['roles'] });
    if (!findUser) throw new HttpException(409, "User doesn't exist");

    const findRole:RoleEntity = await RoleEntity.findOne({ where: { id: roleId } });
    if (!findRole) throw new HttpException(409, "Role doesn't exist");

    findUser.roles = findUser.roles.filter(role => role.id !== roleId);
    await findUser.save();

    const updateUser: User = await UserEntity.findOne({ where: { id: userId }, relations: ['roles'] });
    return updateUser;
  }

  public async userDelete(userId: number): Promise<User> {
    const findUser: User = await UserEntity.findOne({ where: { id: userId } });
    if (!findUser) throw new HttpException(409, "User doesn't exist");

    await UserEntity.delete({ id: userId });
    return findUser;
  }


}
