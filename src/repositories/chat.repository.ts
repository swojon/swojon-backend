import { CreateMessageDTO } from "@/dtos/chat.dto";
import { ChatMessageEntity } from "@/entities/chatMessage.entity";
import { ChatRoomEntity, ChatRoomMemberEntity } from "@/entities/userChats.entity";
import { UserEntity } from "@/entities/users.entity";
import { HttpException } from "@/exceptions/httpException";
import { ChatRoom, Chat, chatRoomList, ChatMessageList } from "@/interfaces/chat.interface";
import { ChatRooms } from "@/typedefs/chat.type";
import { User } from "discord.js";
import { EntityRepository } from "typeorm";


@EntityRepository(ChatMessageEntity)
export class ChatMessageRepository{

  public async messageSend(chatData:CreateMessageDTO): Promise<Chat>{

    const findUsers: [UserEntity[], number] = await UserEntity.findAndCount({ where: [{ id: chatData.senderId }, {id:chatData.receiverId}] });
    if (findUsers[1] < 2) throw new HttpException(409, "User doesn't exist");

    let findChatRoom: ChatRoomEntity;

    if (!chatData.chatRoomId) {
      findChatRoom  = await ChatRoomEntity.create({chatName: `${findUsers[0][0].email.split('@')[0]} and ${findUsers[0][1].email.split('@')[0]}`}).save();
      await ChatRoomMemberEntity.create({chatRoom: findChatRoom, user: findUsers[0][0]}).save();
      await ChatRoomMemberEntity.create({chatRoom: findChatRoom, user: findUsers[0][1]}).save();

    }else{
      findChatRoom = await ChatRoomEntity.findOne({ where: { id: chatData.chatRoomId } });
    }

    if (!findChatRoom) throw new HttpException(409, "Chat room doesn't exist");
    console.log(chatData);

    const createChatMessageData: Chat = await ChatMessageEntity.create({chatRoom: findChatRoom, content: chatData.message, sender: findUsers[0][0]}).save();
    console.log(createChatMessageData);
    return createChatMessageData;
  }

  public async chatRoomList(userId: number): Promise<ChatRooms>{
      const findUser: UserEntity = await UserEntity.findOne({ where: { id: userId} });
      if (!findUser) throw new HttpException(409, "User doesn't exist");

      // const chatRoomMembers:any = await ChatRoomMemberEntity.createQueryBuilder("chat_room_member_entity")
      //                                   .select(["chat_room_member_entity.chatRoom"])
      //                                   .leftJoinAndSelect('chat_room_member_entity.chatRoom', 'chatRoom')
      //                                   .where("chat_room_member_entity.userId = :id", { id: userId }).getManyAndCount()

      const chatRoomMembers: any =  await ChatRoomMemberEntity.findAndCount({ where: { user: findUser }, relations:["chatRoom", "user"] });
      console.log(chatRoomMembers);

      const chatRooms: ChatRooms = {
        items: chatRoomMembers[0].map(chatRoomMember => chatRoomMember.chatRoom),
        count: chatRoomMembers[1]
      }

      return chatRooms;
  }

  public async chatRoomMessageList(chatRoomId: number): Promise<ChatMessageList>{

      const chatMessages = await ChatMessageEntity.findAndCount({ where: { chatRoom: chatRoomId }, relations:["sender"] });
      const chatMessageList: ChatMessageList = {
        items: chatMessages[0],
        count: chatMessages[1]
      }

      return chatMessageList;

  }

}
