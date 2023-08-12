import { CreateMessageDTO } from "@/dtos/chat.dto";
import { ChatMessageEntity } from "@/entities/chatMessage.entity";
import { ChatRoomEntity, ChatRoomMemberEntity } from "@/entities/userChats.entity";
import { UserEntity } from "@/entities/users.entity";
import { HttpException } from "@/exceptions/httpException";
import { ChatRoom, Chat, chatRoomList, ChatMessageList } from "@/interfaces/chat.interface";
import { ChatRoomMember, ChatRoomWithMessage, ChatRooms, ChatRoomsWithMessage } from "@/typedefs/chat.type";
import { User } from "discord.js";
import session from "express-session";
import { EntityRepository, In } from "typeorm";


@EntityRepository(ChatMessageEntity)
export class ChatMessageRepository{

  public async messageSend(chatData:CreateMessageDTO, senderId:number ): Promise<Chat>{

    if (!senderId) throw new HttpException(409, "Sender User Not Found")

    if (!chatData.receiverId && !chatData.chatRoomId) throw new HttpException(409, "Receiver User Not Found")

    let findChatRoom: ChatRoomEntity;
    let findReceiver: UserEntity;

    const findSender:UserEntity = await UserEntity.findOne({ where: { id: senderId} });
    if (!findSender) throw new HttpException(409, "Sender User Not Found")


    if (!chatData.chatRoomId) {
        findReceiver = await UserEntity.findOne({ where: {id:chatData.receiverId} });
        if (!findReceiver) throw new HttpException(409, "Reciever User Not Found");

        findChatRoom  = await ChatRoomEntity.create({chatName: `${findSender.email.split('@')[0]} and ${findReceiver.email.split('@')[0]}`}).save();
        await ChatRoomMemberEntity.create({chatRoom: findChatRoom, user: findSender}).save();
        await ChatRoomMemberEntity.create({chatRoom: findChatRoom, user: findReceiver}).save();
    }else{
      findChatRoom = await ChatRoomEntity.findOne({ where: { id: chatData.chatRoomId } });
    }

    if (!findChatRoom) throw new HttpException(409, "Chat room doesn't exist");
    // console.log(chatData);
    const findChatRoomMembers = await ChatRoomMemberEntity.find({ where: { chatRoom: findChatRoom }, relations:["user"] })
    console.log("chatRoomMembers", findChatRoomMembers)
    let chatRoomMembers = findChatRoomMembers.map((member) => member.user.id )

    if (!chatRoomMembers) chatRoomMembers = findReceiver? [findSender.id, findReceiver.id]: [findSender.id];

    const createChatMessageData: Chat = await ChatMessageEntity.create({chatRoom: findChatRoom, content: chatData.message, sender: findSender}).save();
    console.log(createChatMessageData);
    return {...createChatMessageData, members: chatRoomMembers};
  }

  public async chatRoomList(userId: number|null): Promise<ChatRoomsWithMessage>{
      const findUser: UserEntity = await UserEntity.findOne({ where: { id: userId} });
      if (!findUser) throw new HttpException(409, "User doesn't exist");

      // const chatRoomMembers:any = await ChatRoomMemberEntity.createQueryBuilder("chat_room_member_entity")
      //                                   .select(["chat_room_member_entity.chatRoom"])
      //                                   .leftJoinAndSelect('chat_room_member_entity.chatRoom', 'chatRoom')
      //                                   .where("chat_room_member_entity.userId = :id", { id: userId }).getManyAndCount()

      const chatRoomMembers: [ChatRoomMemberEntity[], number ] =  await ChatRoomMemberEntity.findAndCount({ where: { user: findUser }, relations:["chatRoom", "user"] });
      console.log(chatRoomMembers);

      // const chatRoomMessages:any  = await ChatMessageEntity.find({ where: { chatRoom: In(chatRoomMembers) } }) //not efficient, what if a user have vast amount of message?
      const chatRooms: ChatRooms = {
        items: await Promise.all( chatRoomMembers[0].map(async chatRoomMember => ({ ...chatRoomMember.chatRoom, messages: await ChatMessageEntity.find({ where: { chatRoom: chatRoomMember.chatRoom }, relations:["sender"]}) }) ) ),
        count: chatRoomMembers[1],
      }
      console.log(chatRooms);
      return chatRooms;
  }


//   public async chatRoomList(userId: number): Promise<ChatRoomsWithMessage>{
//     const findUser: UserEntity = await UserEntity.findOne({ where: { id: userId} });
//     if (!findUser) throw new HttpException(409, "User doesn't exist");

//     // const chatRoomMembers:any = await ChatRoomMemberEntity.createQueryBuilder("chat_room_member_entity")
//     //                                   .select(["chat_room_member_entity.chatRoom"])
//     //                                   .leftJoinAndSelect('chat_room_member_entity.chatRoom', 'chatRoom')
//     //                                   .where("chat_room_member_entity.userId = :id", { id: userId }).getManyAndCount()

//     const chatRoomMembers: [ChatRoomMemberEntity[], number ] =  await ChatRoomMemberEntity.findAndCount({ where: { user: findUser }, relations:["chatRoom", "user"] });
//     console.log(chatRoomMembers);
//     let messages: ChatMessageEntity[] = []
//     for (const chatRoomMember of chatRoomMembers[0]){
//       // console.log("chatRoom Id", chatRoomMember.id)
//       const chatRoomMessages = await ChatMessageEntity.createQueryBuilder("chat_message_entity")
//                   .leftJoinAndSelect('chat_message_entity.sender', 'sender')
//                   .where("chat_message_entity.chatRoomId = :id", { id: chatRoomMember.chatRoom.id }).getMany()
//       // console.log("chatRoomMessages", chatRoomMessages)
//       messages = [...messages, ...chatRoomMessages]
//     }

//     console.log(messages);
//     // const chatRoomMessages:any  = await ChatMessageEntity.find({ where: { chatRoom: In(chatRoomMembers) } }) //not efficient, what if a user have vast amount of message?
//     const chatRooms: ChatRoomsWithMessage = {
//       items: chatRoomMembers[0].map(chatRoomMember => ({ ...chatRoomMember.chatRoom, messages: messages.filter(item => item.chatRoom === chatRoomMember.chatRoom) }) ),
//       count: chatRoomMembers[1],
//     }
//     console.log(chatRooms);
//     return chatRooms;
// }

public async chatRoomMessageList(chatRoomId: number): Promise<ChatMessageList>{

    const chatMessages = await ChatMessageEntity.createQueryBuilder("chat_message_entity")
                                                .leftJoinAndSelect('chat_message_entity.sender', 'sender')
                                                .where("chat_message_entity.chatRoomId = :id", { id: chatRoomId }).getManyAndCount()


    // findAndCount({ where: { chatRoomId: chatRoomId }, relations:["sender"] });
    const chatMessageList: ChatMessageList = {
      items: chatMessages[0],
      count: chatMessages[1]
    }

    return chatMessageList;

}


}
