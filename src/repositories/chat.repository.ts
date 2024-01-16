import { PagingArgs } from "@/dtos/category.dto";
import { CreateMessageDTO } from "@/dtos/chat.dto";
import { ChatMessageEntity } from "@/entities/chatMessage.entity";
import { ListingEntity } from "@/entities/listing.entity";
import { ChatRoomEntity, ChatRoomMemberEntity } from "@/entities/userChats.entity";
import { UserEntity } from "@/entities/users.entity";
import { HttpException } from "@/exceptions/httpException";
import { ChatMessageList } from "@/interfaces/chat.interface";
import { Chat, ChatRoom, ChatRooms, ChatRoomsWithMessage,  } from "@/typedefs/chat.type";

import { EntityRepository } from "typeorm";


@EntityRepository(ChatMessageEntity)
export class ChatMessageRepository{

  public async messageSend(chatData:CreateMessageDTO, senderId:number ): Promise<Chat>{
    // if sender Id is not found, then the whole request is invalide
    if (!senderId) throw new HttpException(409, "Sender User Not Found")
    // if any of the chatroomId or receiver Id is not present, then the destination is invalid
    if (!chatData.receiverId && !chatData.chatRoomId) throw new HttpException(409, "Receiver User Not Found")

    let findChatRoom: ChatRoomEntity;
    let findReceiver: UserEntity;

    const findSender:UserEntity = await UserEntity.findOne({ where: { id: senderId} });
    if (!findSender) throw new HttpException(409, "Sender User Not Found")
    
  

    let findListing = null;

    if (chatData.relatedListingId){
        findListing = await ListingEntity.findOne({where: {id: chatData.relatedListingId}})
        if (!findListing) throw new HttpException(409, "Listing Not Found");
    }

    //create chatRoom if not already provided, If Provided, then try to fetch the chatRoom
    if (!chatData.chatRoomId) {
        findReceiver = await UserEntity.findOne({ where: {id:chatData.receiverId} });
        if (!findReceiver) throw new HttpException(409, "Reciever User Not Found");
        
        if (findSender.id === findReceiver.id ){
          throw new HttpException(409, "Sender Id and Receiver Id can't be Same.")
        }
        //check if a chatroom exist with the similiar context?
        findChatRoom = await ChatRoomEntity.createQueryBuilder('crm')
                          .innerJoin("crm.members", "member1")
                          .innerJoin("crm.members", "member2")
                          .where("member1.userId = :userId1", { userId1: findSender.id })
                          .andWhere("member2.userId = :userId2", { userId2: findReceiver.id })
                          .andWhere("crm.relatedListingId = :relatedListingId", {relatedListingId: findListing.id})
                          .getOne()
        if (!findChatRoom) {
          findChatRoom  = await ChatRoomEntity.create({relatedListing: findListing, chatName: `${findSender.email.split('@')[0]} and ${findReceiver.email.split('@')[0]}`}).save();
          await ChatRoomMemberEntity.create({chatRoom: findChatRoom, user: findSender}).save();
          await ChatRoomMemberEntity.create({chatRoom: findChatRoom, user: findReceiver}).save();
        }
    }else{
      findChatRoom = await ChatRoomEntity.findOne({ where: { id: chatData.chatRoomId }, relations: ["members", "members.user", "relatedListing"] });
    }
   
    // if still we don't have any chatRoom, its probably an error
    if (!findChatRoom) throw new HttpException(409, "Chat room doesn't exist");

    const createChatMessageData = await ChatMessageEntity.create({chatRoom: findChatRoom, content: chatData.message, sender: findSender}).save();
    return createChatMessageData
  }
  public async chatRoomGet(userId: number|null, id: number|null):Promise<ChatRoom>{
      const chatRoom = await ChatRoomEntity.findOne(id, {
          relations: ["members", "relatedListing", "members.user", "members.user.profile"],
          select: ["id", "chatName"]
        })
      if (!chatRoom) throw new HttpException(409, "Chat Room Doesn't Exist")

      // @todo add check if the user is a member. Otherwise return 404
      return chatRoom

  }
  public async chatRoomList(userId: number|null): Promise<ChatRoomsWithMessage>{
      
    const chatRoomMembers = await ChatRoomMemberEntity.createQueryBuilder('crm')
                                .select([ "crm.chatRoomId", "crm.userId"])
                                // .leftJoinAndSelect("crm.user", "user")
                                .leftJoinAndSelect("crm.chatRoom", "chatRoom")
                                .leftJoinAndSelect("chatRoom.members", "members")
                                .leftJoinAndSelect("chatRoom.relatedListing", "relatedListing")
                                .leftJoinAndSelect("members.user", "user")
                                .where('crm.userId = :userId', {userId: userId})
                                .getManyAndCount()
    

        const chatRooms: ChatRooms = {
            items: await Promise.all( chatRoomMembers[0].map(async crm => ({ 
                ...crm.chatRoom, 
                members: crm.chatRoom.members, 
                messages: await ChatMessageEntity.find(
                    { where: { chatRoom: crm.chatRoom }, 
                        take: 1, 
                        order: {id : "DESC"} ,
                        relations:["sender"]}) 
                    }) 
                )),
            count: chatRoomMembers[1]
        }
      console.log(chatRooms);
      return chatRooms;
  }
 
  public async chatRoomListAdmin(): Promise<ChatRoomsWithMessage>{
    const chatRoomMembers = await ChatRoomMemberEntity.createQueryBuilder('crm')
                                // .select([ "chatRoomId", "userId"])
                                // .leftJoinAndSelect("crm.user", "user")
                                .leftJoinAndSelect("crm.chatRoom", "chatRoom")
                                .leftJoinAndSelect("chatRoom.members", "members")
                                .leftJoinAndSelect("chatRoom.relatedListing", "relatedListing")
                                .leftJoinAndSelect("members.user", "user")
                                .getManyAndCount()

    console.log("chatRoomMembers", chatRoomMembers)

    // const chatRoomMessages:any  = await ChatMessageEntity.find({ where: { chatRoom: In(chatRoomMembers) } }) //not efficient, what if a user have vast amount of message?
    const chatRooms: ChatRooms = {
      items: await Promise.all( chatRoomMembers[0].map(async crm => ({ 
        ...crm.chatRoom, 
        members: crm.chatRoom.members, 
        messages: await ChatMessageEntity.find(
            { where: { chatRoom: crm.chatRoom }, 
                take: 1, 
                order: {id : "DESC"} ,
                relations:["sender"]}) 
            }) 
        )),
      count: chatRoomMembers[1],
    }
    return chatRooms;
}

public async chatRoomMessageList(chatRoomId: number, paging: PagingArgs): Promise<ChatMessageList>{

    let sql = ChatMessageEntity.createQueryBuilder("chat_message_entity")
              .leftJoinAndSelect('chat_message_entity.sender', 'sender')
              .leftJoinAndSelect('chat_message_entity.chatRoom', "chatRoom")
              .leftJoinAndSelect('chatRoom.members', "members")
              .leftJoinAndSelect("members.user", 'user')
              .where("chat_message_entity.chatRoomId = :id", { id: chatRoomId })
              .orderBy('chat_message_entity.dateSent', 'DESC')
              .addOrderBy('chat_message_entity.id', "DESC")
              // .getManyAndCount()

    if (paging.starting_after){
      sql = sql.where("chat_message_entity.id > :starting_after", {starting_after: paging.starting_after})
    }else if (paging.ending_before){
      sql = sql.where("chat_message_entity.id < :ending_before", {ending_before: paging.ending_before} )
    }
    
    const limit:number = Math.min(20, paging.limit? paging.limit: 20)
    sql = sql.take(limit)
    
    const chatMessages = await sql.getManyAndCount()
    // findAndCount({ where: { chatRoomId: chatRoomId }, relations:["sender"] });
    const hasMore = chatMessages[0].length === limit;
    const chatMessageList: ChatMessageList = {
      items: chatMessages[0],
      count: chatMessages[1],
      hasMore 
    }

    return chatMessageList;

}


}
