import { hash } from 'bcrypt';
import { EntityRepository } from 'typeorm';
import { CreateUserDto, UpdateUserDto } from '@dtos/users.dto';
import { UserEntity } from '@entities/users.entity';
import { HttpException } from '@exceptions/httpException';
import { User, UserWithMeta } from '@interfaces/users.interface';
import { ProfileEntity } from '@/entities/profile.entity';
import { RoleEntity } from '@/entities/role.entity';
import { Role } from '@/interfaces/role.interface';
import { FollowEntity } from '@/entities/follow.entity';
import { Community } from '@/interfaces/community.interface';
import { CommunityMemberEntity } from '@/entities/communityMember.entity';
import { ListingEntity } from '@/entities/listing.entity';
import { PointRepository } from './point.repository';



@EntityRepository(UserEntity)
export class UserRepository {
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

  public async userFindById(userId: number): Promise<UserWithMeta> {
    const user: User = await UserEntity.findOne({ where: { id: userId }, relations: ['profile', 'roles']});
    if (!user) throw new HttpException(409, "User doesn't exist");
    const followerCount:number = await FollowEntity.count({where: {followedUser: user}})
    const followingCount:number = await FollowEntity.count({where: {user: user}})
    const communities: Community[] = await CommunityMemberEntity.find({
                    where: {user: user},
                    relations: ["community"]
                  })
    const listingCount: number = await ListingEntity.count({where: {user: user}})
    const pointBalance: number = await new PointRepository().pointBalanceQuery(user.id)

    return {...user, followerCount, followingCount, communities, listingCount, pointBalance };
  }

  public async userCreate(userData: CreateUserDto): Promise<User> {
    const findUser: User = await UserEntity.findOne({ where: { email: userData.email } });
    if (findUser) throw new HttpException(409, `This email ${userData.email} already exists`);

    const hashedPassword = await hash(userData.password, 10);
    const createUserData: User = await UserEntity.create({ ...userData, password: hashedPassword, profile: new ProfileEntity() }).save();

    return createUserData;
  }

  public async userUpdate(userId: number, userData: UpdateUserDto): Promise<User> {
    const findUser: User = await UserEntity.findOne({ where: { id: userId } });
    if (!findUser) throw new HttpException(409, "User doesn't exist");

    if (userData.password){
      const hashedPassword = await hash(userData.password, 10);
      await UserEntity.update(userId, { ...userData, password: hashedPassword });
    }
    const to_update = {}
    userData.isApproved? to_update["isApproved"] = userData.isApproved : null
    userData.isStaff? to_update["isStaff"] = userData.isStaff : null
    userData.isSuperAdmin? to_update["isSuperAdmin"]= userData.isSuperAdmin : null
    userData.username? to_update["username"]= userData.username : null

    await UserEntity.update(userId,  to_update)
    const updateUser: User = await UserEntity.findOne({ where: { id: userId } });
    return updateUser;
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
