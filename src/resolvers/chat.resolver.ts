import { PagingArgs } from "@/dtos/category.dto";
import { CreateMessageDTO, ListChatRoomArgs } from "@/dtos/chat.dto";
import { NotificationEntity, NotificationType } from "@/entities/notification.entity";
import { MyContext } from "@/interfaces/auth.interface";
import { sendFirstMessageMail } from "@/mail/sendMail";
import { isLoggedIn, isStaff } from "@/permission";
import { ChatMessageRepository } from "@/repositories/chat.repository";
import { Chat, ChatRoomWithMessage, ChatRooms, ChatRoomsWithMessage, Chats, ChatRoom } from "@/typedefs/chat.type";
import { Notification } from "@/typedefs/notification.type";
import { Arg, Args, Authorized, Ctx, Mutation, PubSub, Publisher, Query, Resolver } from "type-graphql";
import { TOPICS_ENUM } from "./subscription.resolver";


@Resolver()
export class ChatResolver extends ChatMessageRepository {

  // @Authorized()
  @Query(() => Chats, {
    description: 'List All Chat Messages',
  })
  async listChatMessages(@Arg('chatRoomId') chatRoomId:number, @Args() paging: PagingArgs, @Ctx() ctx:MyContext): Promise<Chats> {
    if (!isLoggedIn(ctx.user)) {
      throw new Error("You must be logged in to access this resource");
    }
    const chatMessages = await this.chatRoomMessageList(chatRoomId, paging);
    return chatMessages;
  }

  // @Authorized()
  @Mutation(() => Chat, {
    description: 'Send Chat Message',
  })
  async sendChatMessage(@Arg('chatData') chatData: CreateMessageDTO, @Ctx() ctx:MyContext, @PubSub(TOPICS_ENUM.NEW_CHAT_MESSAGE) publish: Publisher<Chat>, @PubSub(TOPICS_ENUM.NEW_NOTIFICATION) notify: Publisher<Notification>): Promise<Chat> {
    if (!isLoggedIn(ctx.user)) {
      throw new Error("You must be logged in to access this resource");
    }
    const senderId = chatData.senderId ??  ctx.user.id;
    const chatMessage = await this.messageSend(chatData, senderId);
    await publish(chatMessage); 
    setTimeout(() => {
        chatMessage.chatRoom.members.forEach(async member => {
          if (member.userId != senderId){
            const newNotification = await NotificationEntity.create({
                userId: member.userId,
                type: NotificationType.INFO,
                content: `We've got new message from ${chatMessage.sender.username} : ${chatMessage.content}` ,
                chatRoomId: chatMessage.chatRoom.id                
            }).save()
            console.log("publishing")
            await notify(newNotification);
          }
        })
    }, 1000)

    
    return chatMessage;
  }
 // @Authorized()
 @Query(() => ChatRoom, {
  description: "Get ChatRoom by id",
  })
  async getChatRoom(@Ctx() ctx:MyContext, @Args(){userId, id}: ListChatRoomArgs): Promise<ChatRoom> {
    if (!isLoggedIn(ctx.user)) {
      throw new Error("You must be logged in to access this resource");
    }
    if (!userId) userId = ctx.user.id;
    const chatRooms = await this.chatRoomGet(userId, id);
    return chatRooms;
  }

  // @Authorized()
  @Query(() => ChatRoomsWithMessage, {
    description: "List All Chat Rooms of a User with message",
  })
  async listChatRooms(@Ctx() ctx:MyContext, @Args(){userId}: ListChatRoomArgs): Promise<ChatRoomsWithMessage> {
    if (!isLoggedIn(ctx.user)) {
      throw new Error("You must be logged in to access this resource");
    }
    if (!userId) userId = ctx.user.id;
    const chatRooms = await this.chatRoomList(userId);
    return chatRooms;
  }


 // Only admin & Moderator can access this
 @Query(() => ChatRoomsWithMessage, {
  description: "List All Chat Rooms of a User with message",
  })
  async listChatRoomsAdmin(@Ctx() ctx:MyContext): Promise<ChatRoomsWithMessage> {
    //staff can list all chat rooms
    if (!isStaff(ctx.user)) {
      throw new Error("You don't have permission to access this resource");
    }
    const chatRooms = await this.chatRoomListAdmin();
    return chatRooms;
  }

}
