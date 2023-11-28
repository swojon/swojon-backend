import { PagingArgs, CategoryFilterInput } from "@/dtos/category.dto";
import { NotificationFilterInput } from "@/dtos/notification.dto";
import { MyContext } from "@/interfaces/auth.interface";
import { NotificationRepository } from "@/repositories/notification.repository";
import { Notification, Notifications } from "@/typedefs/notification.type";
import { Arg, Args, Ctx, Mutation, Query, Resolver } from "type-graphql";

@Resolver()
export class NotificationResolver extends NotificationRepository {
    
  // @Authorized()
  @Query(() => Notifications, {
    description: 'List All Notifications0',
  })
  async listCategories(@Ctx() ctx:MyContext, @Args() paging: PagingArgs, @Arg('filters', { nullable: true }) filters? : NotificationFilterInput): Promise<Notifications> {
    const userId = ctx.user?.id;
    const notifications:Notifications = await this.notificationList(userId, paging, filters);
    return notifications;
  }

  // @Authorized()
  @Mutation(() => Notification, {
    description: 'Mark Notification as Read',
  })
  async markNotificationRead(@Arg('notificationId') notificationId: number): Promise<Notification> {
    const notification: Notification = await this.notificationMarkRead(notificationId);
    return notification;
  }

  

}