import { CreateMessageDTO } from "@/dtos/chat.dto";
import { ChatMessageRepository } from "@/repositories/chat.repository";
import { Chat, ChatRooms, Chats } from "@/typedefs/chat.type";
import { Arg, Authorized, Mutation, Query, Resolver } from "type-graphql";


@Resolver()
export class ChatResolver extends ChatMessageRepository {

  @Authorized()
  @Query(() => Chats, {
    description: 'List All Chat Messages',
  })
  async listChatMessages(@Arg('chatRoomId') chatRoomId:number): Promise<Chats> {
    const chatMessages = await this.chatRoomMessageList(chatRoomId);
    return chatMessages;
  }

  @Authorized()
  @Mutation(() => Chat, {
    description: 'Send Chat Message',
  })
  async sendChatMessage(@Arg('chatData') chatData: CreateMessageDTO): Promise<Chat> {
    const chatMessage = await this.messageSend(chatData);
    return chatMessage;
  }

  @Authorized()
  @Query(() => ChatRooms, {
    description: "List All Chat Rooms of a User",
  })
  async listChatRooms(@Arg('userId') userId:number): Promise<ChatRooms> {
    const chatRooms = await this.chatRoomList(userId);
    return chatRooms;
  }

}
