import { FollowEntity } from "@/entities/follow.entity";
import { UserEntity } from "@/entities/users.entity";
import { HttpException } from "@/exceptions/httpException";
import { Follow, Following } from "@/interfaces/follow.interface";
import { Follower } from "@/interfaces/Follower.interface";
import { Followers } from "@/typedefs/follow.type";
import { EntityRepository } from "typeorm";


@EntityRepository(FollowEntity)
export class FollowRepository{

  public async followAdd(userId:number, followedUserId:number): Promise<Follow>{
    const findUser: UserEntity = await UserEntity.findOne({ where: { id: userId} });
    if (!findUser) throw new HttpException(409, "User doesn't exist");

    const findFollowedUser: UserEntity = await UserEntity.findOne({ where: { id: followedUserId } });
    if (!findFollowedUser) throw new HttpException(409, "Followed User doesn't exist");

    const findFollow: Follow = await FollowEntity.findOne({ where: { user: findUser, followedUser: findFollowedUser} });
    if (findFollow) throw new HttpException(409, `You are already following`);

    const createFollowData: Follow = await FollowEntity.create({user: findUser, followedUser: findFollowedUser}).save();

    return createFollowData;
  }

  public async followRemove(userId:number, followedUserId:number): Promise<Follow>{
    const findUser: UserEntity = await UserEntity.findOne({ where: { id:userId } });
    if (!findUser) throw new HttpException(409, "User doesn't exist");

    // const findFollowedUser: UserEntity = await UserEntity.findOne({ where: { id: followedUserId } });
    // if (!findFollowedUser) throw new HttpException(409, "Followed User doesn't exist");

    // const findFollow: FollowEntity = await FollowEntity.findOne({ where: { user: findUser, followedUser: findFollowedUser} });
    // if (!findFollow) throw new HttpException(409, `You are not following`);
    // // const createFollowData: Follow = await FollowEntity.create(followData).save();
    
    const findFollow: FollowEntity = await FollowEntity.findOne({ where: {userId: userId, followedUserId: followedUserId}, relations: ["followedUser", "user"]})
    if (!findFollow) throw new HttpException(409, "follower or followed User mismatch!")

    await FollowEntity.softRemove(findFollow)
    return findFollow;
    
  }

  public async followerList(userId: number, requestedUserId: any): Promise<Followers>{

    const follow = await FollowEntity.createQueryBuilder("follow_entity")
                  .select(["follow_entity.id", "follow_entity.isDeleted", "follow_entity.dateFollowed", "follow_entity.followedUserId", "follow_entity.userId"])
                  .leftJoinAndSelect('follow_entity.user', 'user')
                  .where("follow_entity.followedUserId = :id", { id: userId }).printSql().getManyAndCount()

    const following = await FollowEntity.createQueryBuilder('following_entity')
                      .select(['following_entity.userId', 'following_entity.followedUserId'])
                      .where("following_entity.userId = :id", {id: userId}).printSql().getMany()

    const findFollowers = follow[0].map((follow) => {
      
      return  {
        id: follow.id,
        user: follow.user, 
        followStatus: requestedUserId ? following.filter(fol => fol.userId === requestedUserId).length > 0 : false  }
    });
    const count: number = follow[1];
    
    const followers: Followers = {
      count: count,
      items: findFollowers
    }

    return followers;
  }

  public async followingList(userId: number, requestedUserId: any): Promise<Followers>{
    const follow = await FollowEntity.createQueryBuilder("follow_entity")
            .select(["follow_entity.id", "follow_entity.isDeleted", "follow_entity.dateFollowed", "follow_entity.followedUserId", "follow_entity.userId"])
            .leftJoinAndSelect('follow_entity.followedUser', 'followedUser')
            .leftJoinAndSelect('follow_entity.user', 'user')
           .where("follow_entity.userId = :id", { id: userId }).printSql().getManyAndCount()

    const findFollowings :Follower[] = follow[0].map((fol) => {
          return {
              id: fol.id,
              user: fol.followedUser, 
              followStatus: requestedUserId ?  true : false
            }     
      });

    const count: number = follow[1];

    const followers: Followers = {
      count: count,
      items: findFollowings
    }

    return followers;
  }

}
