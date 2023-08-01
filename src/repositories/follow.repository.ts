import { FollowEntity } from "@/entities/follow.entity";
import { UserEntity } from "@/entities/users.entity";
import { HttpException } from "@/exceptions/httpException";
import { Follow, Following } from "@/interfaces/follow.interface";
import { Follower } from "@/interfaces/Follower.interface";
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

    const findFollowedUser: UserEntity = await UserEntity.findOne({ where: { id: followedUserId } });
    if (!findFollowedUser) throw new HttpException(409, "Followed User doesn't exist");

    const findFollow: FollowEntity = await FollowEntity.findOne({ where: { user: findUser, followedUser: findFollowedUser} });
    if (!findFollow) throw new HttpException(409, `You are not following`);
    // const createFollowData: Follow = await FollowEntity.create(followData).save();
    findFollow.isDeleted = true;
    const createFollowData: Follow = await FollowEntity.save(findFollow);
    return createFollowData;
  }

  public async followerList(userId: number): Promise<Follower>{

    const follow = await FollowEntity.createQueryBuilder("follow_entity")
                  .select(["follow_entity.id", "follow_entity.isDeleted", "follow_entity.dateFollowed", "follow_entity.followedUserId", "follow_entity.userId"])
                  .leftJoinAndSelect('follow_entity.user', 'user')
                  .where("follow_entity.followedUserId = :id", { id: userId }).printSql().getManyAndCount()

    const findFollowers:UserEntity[] = follow[0].map((follow) => follow.user);
    const count: number = follow[1];

    const follower: Follower = {
      count: count,
      items: findFollowers
    }

    return follower;
  }

  public async followingList(userId: number): Promise<Follower>{
    const follow = await FollowEntity.createQueryBuilder("follow_entity")
            .select(["follow_entity.id", "follow_entity.isDeleted", "follow_entity.dateFollowed", "follow_entity.followedUserId", "follow_entity.userId"])
            .leftJoinAndSelect('follow_entity.followedUser', 'user')
           .where("follow_entity.userId = :id", { id: userId }).printSql().getManyAndCount()

    const findFollowing :UserEntity[] = follow[0].map((follow) => follow.followedUser);
    const count: number = follow[1];

    const follower: Follower = {
      count: count,
      items: findFollowing
    }

    return follower;
  }

}
