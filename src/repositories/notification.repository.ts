import { CategoryArgs, CategoryCreateDTO, CategoryFilterInput, CategoryRemoveDTO, CategoryUpdateDTO, PagingArgs } from "@/dtos/category.dto";
import { CommunityFilterInput } from "@/dtos/community.dto";
import { NotificationFilterInput } from "@/dtos/notification.dto";
import { CategoryEntity, Status } from "@/entities/category.entity";
import { NotificationEntity } from "@/entities/notification.entity";
import { HttpException } from "@/exceptions/httpException";
import { Categories, Category } from "@/interfaces/category.interface";
import { Notifications, Notification } from "@/interfaces/notification.interface";
import { registerEnumType } from "type-graphql";
import { EntityRepository, In, LessThan, MoreThan, UpdateResult } from "typeorm";

@EntityRepository(NotificationEntity)
export class NotificationRepository{

  public async notificationList(userId, paging: PagingArgs, filters: NotificationFilterInput ): Promise<Notifications> {

    let sql = NotificationEntity.createQueryBuilder("ne")
                    .select(["ne.id", "ne.content", "ne.dateCreated",
                             "ne.type", "ne.read", 'ne.userId', 'ne.chatRoomId', 'ne.listingId'])
                    .leftJoinAndSelect('ne.user', 'user')
                    .orderBy('ne.id', 'ASC')
                    .where(`ne.userId=${userId}`)

    if (paging.starting_after){
      sql = sql.andWhere("ne.id > :starting_after", {starting_after: paging.starting_after})
    }else if (paging.ending_before){
      sql = sql.andWhere("ne.id < :ending_before", {ending_before: paging.ending_before} )
    }

    if (!!filters?.unreadOnly ){
        sql = sql.andWhere("ne.read = false")
    }

    const limit:number = Math.min(100, paging.limit? paging.limit: 100)
    sql = sql.limit(limit)

    const findNotifications = await sql.getManyAndCount()

    const notificationList = findNotifications[0]
    const count = findNotifications[1]

    // const categoryTree: Category[] =  getCategoryTree(categoryList, null)

    const hasMore = notificationList.length === limit;

    // const prevCursor = paging.starting_after? paging.starting_after: paging.ending_before? paging.ending_before: null
    // const nextCursor = categoryList[categoryList.length -1].id

    return {items: notificationList, hasMore, count}

  }

  public async notificationMarkRead(notificationId: number): Promise<Notification> {
    const notification: NotificationEntity = await NotificationEntity.findOne({ where: { id: notificationId } });
    
    await NotificationEntity.update({ id: notificationId }, {read:true});

    // const updatedCategory: CategoryEntity = await CategoryEntity.findOne({ where: { id: categoryId }, relations: ['parentCategory'] });
    return notification;

  }

  public async notificationMarkAllAsRead(userId:any):Promise<Notifications>{
    if (!userId) throw new HttpException(409, "User is not logged in");
    await NotificationEntity.update({userId: userId}, {read: true })

    return{
      items: []
    }
  }


}
