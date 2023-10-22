
import { ChatRoomMemberEntity } from "@/entities/userChats.entity";
import { HttpException } from "@/exceptions/httpException";
import { pubSub } from "@/pubsub";
import { Chat } from "@/typedefs/chat.type";
import { withFilter } from "graphql-subscriptions";
import {  Arg, Authorized, Ctx, Resolver, Root, Subscription } from "type-graphql";


export enum TOPICS_ENUM{
  NEW_CHAT_ROOM =  'CHAT_ROOM',
  NEW_CHAT_MESSAGE = 'CHAT_MESSAGE',
}


@Resolver()
export class SubscriptionResolver {
  @Subscription({
    subscribe: withFilter((_, __, payload) => {
      console.log("payload", payload)
      if (!payload.currentUser) {
        throw new Error("You don't have permission to access this resource");
      }
      return pubSub.asyncIterator(TOPICS_ENUM.NEW_CHAT_MESSAGE);
    },
    (payload, variables, context) => {
      console.log(payload)
      console.log("context:-", context)
      return payload.chatRoom.id === variables.chatRoomId && payload.members.includes(context.currentUser.id);
    }
    )
  })
  newMessageAdded(@Root() payload: any, @Arg('chatRoomId') chatRoomId: number): Chat {
    // console.log("newMessageAdded():-", payload);
    return payload;
  }

}
