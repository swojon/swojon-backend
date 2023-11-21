import { Arg, Authorized, Ctx, Mutation, Query, Resolver } from 'type-graphql';

import { FollowRepository } from '@/repositories/follow.repository';
import { Follow, Followers } from '@/typedefs/follow.type';
import { MyContext } from '@/interfaces/auth.interface';

@Resolver()
export class FollowResolver extends FollowRepository {
  // @Authorized()
  @Query(() => Followers, {
    description: 'List All Followerer',
  })
  async listFollowers(@Ctx() ctx:MyContext, @Arg('userId') userId: number): Promise<Followers> {
    const requestedUserId = ctx.user?.id;
    const follower: Followers = await this.followerList(userId, requestedUserId);
    return follower;

  }

  // @Authorized()
  @Query(() => Followers, {
    description: 'List All Following',
  })
  async listFollowing(@Ctx() ctx:MyContext, @Arg('userId') userId: number): Promise<Followers> {
    const requestedUserId = ctx.user?.id;
    const following: Followers = await this.followingList(userId, requestedUserId );
    return following;
  }

  // @Authorized()
  @Mutation(() => Follow, {
    description: 'Follow user',
  })
  async addFollow(@Arg('userId') userId: number, @Arg('followedUserId') followedUserId: number): Promise<Follow> {
    const follow: Follow = await this.followAdd(userId, followedUserId);
    return follow;
  }

  // @Authorized()
  @Mutation(() => Follow, {
    description: 'Unfollow user',
  })
  async removeFollow(@Arg('userId') userId: number, @Arg('followedUserId') followedUserId: number): Promise<Follow> {
    const follow: Follow = await this.followRemove(userId, followedUserId);
    return follow;
  }

}
