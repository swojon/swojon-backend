import { Arg, Authorized, Ctx, Mutation, Publisher, PubSub, Query, Resolver } from 'type-graphql';

import { FollowRepository } from '@/repositories/follow.repository';
import { Follow, Followers } from '@/typedefs/follow.type';
import { MyContext } from '@/interfaces/auth.interface';
import { TOPICS_ENUM } from './subscription.resolver';
import { NotificationEntity, NotificationType } from '@/entities/notification.entity';
import { Notification } from "@/typedefs/notification.type";
import { isStaffOrSelf } from '@/permission';
@Resolver()
export class FollowResolver extends FollowRepository {
  // @Authorized()
  @Query(() => Followers, {
    description: 'List All Followerer',
  })
  async listFollowers(@Ctx() ctx:MyContext, @Arg('usernameOrId') usernameOrId: string): Promise<Followers> {
    const requestedUserId = ctx.user?.id;
    const follower: Followers = await this.followerList(usernameOrId, requestedUserId);
    return follower;

  }

  // @Authorized()
  @Query(() => Followers, {
    description: 'List All Following',
  })
  async listFollowing(@Ctx() ctx:MyContext, @Arg('usernameOrId') usernameOrId: string): Promise<Followers> {
    const requestedUserId = ctx.user?.id;
    const following: Followers = await this.followingList(usernameOrId, requestedUserId );
    return following;
  }

  // @Authorized()
  @Mutation(() => Follow, {
    description: 'Follow user',
  })
  async addFollow(@Arg('userId') userId: number, @Arg('followedUserId') followedUserId: number, @PubSub(TOPICS_ENUM.NEW_NOTIFICATION) notify: Publisher<Notification>, @Ctx() ctx:MyContext): Promise<Follow> {
    if (!isStaffOrSelf(ctx.user, followedUserId) && !isStaffOrSelf(ctx.user, userId)) {
      throw new Error("You don't have permission to access this resource");
    }
    const follow: Follow = await this.followAdd(userId, followedUserId);
    setTimeout(async () => {
          const newNotification = await NotificationEntity.create({
              user : follow.followedUser,
              type: NotificationType.INFO,
              content: `${follow.user.username} started following you.`,
              relatedUserUsername: follow.user.username
          }).save();

          console.log("publishing")
          await notify(newNotification);
        }, 1000);
    return follow;
  }

  // @Authorized()
  @Mutation(() => Follow, {
    description: 'Unfollow user',
  })
  async removeFollow(@Arg('userId') userId: number, @Arg('followedUserId') followedUserId: number, @Ctx() ctx:MyContext): Promise<Follow> {
    console.log(ctx.user)
    if (!isStaffOrSelf(ctx.user, followedUserId) && !isStaffOrSelf(ctx.user, userId)) {
      throw new Error("You don't have permission to access this resourceas");
    }
    const follow: Follow = await this.followRemove(userId, followedUserId);
    return follow;
  }

}
