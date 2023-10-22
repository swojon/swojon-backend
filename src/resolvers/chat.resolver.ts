import { CreateMessageDTO, ListChatRoomArgs } from "@/dtos/chat.dto";
import { MyContext } from "@/interfaces/auth.interface";
import { ChatMessageRepository } from "@/repositories/chat.repository";
import { Chat, ChatRoomWithMessage, ChatRooms, ChatRoomsWithMessage, Chats } from "@/typedefs/chat.type";
import { Arg, Args, Authorized, Ctx, Mutation, PubSub, Publisher, Query, Resolver } from "type-graphql";
import { TOPICS_ENUM } from "./subscription.resolver";


@Resolver()
export class ChatResolver extends ChatMessageRepository {

  // @Authorized()
  @Query(() => Chats, {
    description: 'List All Chat Messages',
  })
  async listChatMessages(@Arg('chatRoomId') chatRoomId:number): Promise<Chats> {
    const chatMessages = await this.chatRoomMessageList(chatRoomId);
    return chatMessages;
  }

  // @Authorized()
  @Mutation(() => Chat, {
    description: 'Send Chat Message',
  })
  async sendChatMessage(@Arg('chatData') chatData: CreateMessageDTO, @Ctx() ctx:MyContext, @PubSub(TOPICS_ENUM.NEW_CHAT_MESSAGE) publish: Publisher<Chat>): Promise<Chat> {
    console.log(ctx.user)
    const senderId = chatData.senderId ??  ctx.user.id;
    const chatMessage = await this.messageSend(chatData, senderId);
    await publish(chatMessage);
    return chatMessage;
  }

  // @Authorized()
  @Query(() => ChatRoomsWithMessage, {
    description: "List All Chat Rooms of a User with message",
  })
  async listChatRooms(@Ctx() ctx:MyContext, @Args(){userId}: ListChatRoomArgs): Promise<ChatRoomsWithMessage> {
    if (!userId) userId = ctx.user.id;
    const chatRooms = await this.chatRoomList(userId);
    return chatRooms;
  }


 // @Authorized() Only admin & Moderator can access this
 @Query(() => ChatRoomsWithMessage, {
  description: "List All Chat Rooms of a User with message",
  })
  async listChatRoomsAdmin(): Promise<ChatRoomsWithMessage> {

    const chatRooms = await this.chatRoomListAdmin();
    return chatRooms;
  }

}
