import { Arg, Authorized, Mutation, Query, Resolver } from 'type-graphql';

import { FollowRepository } from '@/repositories/follow.repository';
import { Follow, Followers } from '@/typedefs/follow.type';

@Resolver()
export class FollowResolver extends FollowRepository {
  @Authorized()
  @Mutation(() => Followers, {
    description: 'List All Followerer',
  })
  async listFollowers(@Arg('userId') userId: number): Promise<Followers> {
    const follower: Followers = await this.followerList(userId);
    return follower;

  }

  @Authorized()
  @Mutation(() => Followers, {
    description: 'List All Following',
  })
  async listFollowing(@Arg('userId') userId: number): Promise<Followers> {
    const following: Followers = await this.followingList(userId);
    return following;
  }

  @Authorized()
  @Mutation(() => Follow, {
    description: 'Follow user',
  })
  async addFollow(@Arg('userId') userId: number, @Arg('followedUserId') followedUserId: number): Promise<Follow> {
    const follow: Follow = await this.followAdd(userId, followedUserId);
    return follow;
  }

  @Authorized()
  @Mutation(() => Follow, {
    description: 'Unfollow user',
  })
  async removeFollow(@Arg('userId') userId: number, @Arg('followedUserId') followedUserId: number): Promise<Follow> {
    const follow: Follow = await this.followRemove(userId, followedUserId);
    return follow;
  }

}
