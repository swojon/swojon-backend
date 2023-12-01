
import { ChatRoomMemberEntity } from "@/entities/userChats.entity";
import { HttpException } from "@/exceptions/httpException";
import { pubSub } from "@/pubsub";
import { Chat } from "@/typedefs/chat.type";
import { Notification } from "@/typedefs/notification.type";
import { withFilter } from "graphql-subscriptions";
import {  Arg, Authorized, Ctx, Resolver, Root, Subscription } from "type-graphql";


export enum TOPICS_ENUM{
  NEW_CHAT_ROOM =  'CHAT_ROOM',
  NEW_CHAT_MESSAGE = 'CHAT_MESSAGE',
  NEW_NOTIFICATION = 'NEW_NOTIFICATION'
}


@Resolver()
export class SubscriptionResolver {
  @Subscription({
    subscribe: withFilter((_, __, payload) => {
      // console.log("payload", payload)
      if (!payload?.currentUser) {
        throw new Error("You don't have permission to access this resource");
      }
      return pubSub.asyncIterator(TOPICS_ENUM.NEW_CHAT_MESSAGE);
    },
    (payload, variables, context) => {
      console.log(payload)
      console.log("context:-", context)
      return payload.chatRoom.id === variables.chatRoomId && payload.chatRoom.members.map(mem => mem.userId).includes(context.currentUser.id);
    }
    )
  })
  newMessageAdded(@Root() payload: any, @Arg('chatRoomId') chatRoomId: number): Chat {
    // console.log("newMessageAdded():-", payload);
    return payload;
  }

  @Subscription({
    subscribe: withFilter((_, __, payload) => {
      // console.log("payload", payload)
      if (!payload?.currentUser) {
        throw new Error("user not logged in");
      }
      return pubSub.asyncIterator(TOPICS_ENUM.NEW_CHAT_MESSAGE);
    },
    (payload, variables, context) => {
      console.log(payload)
      console.log("context:-", context)
      return payload.members.includes(context.currentUser.id);
    }
    )
  })
  newNotifaction(@Root() payload: any): Notification {
    // console.log("newMessageAdded():-", payload);
    return payload;
  }



}
