import { PagingArgs } from "@/dtos/category.dto";
import { CreateMessageDTO } from "@/dtos/chat.dto";
import { ChatMessageEntity } from "@/entities/chatMessage.entity";
import { ListingEntity } from "@/entities/listing.entity";
import { ChatRoomEntity, ChatRoomMemberEntity } from "@/entities/userChats.entity";
import { UserEntity } from "@/entities/users.entity";
import { HttpException } from "@/exceptions/httpException";
import { ChatMessageList } from "@/interfaces/chat.interface";
import { sendFirstMessageMail } from "@/mail/sendMail";
import { Chat, ChatRoom, ChatRooms, ChatRoomsWithMessage,  } from "@/typedefs/chat.type";

import { EntityRepository } from "typeorm";
import { buildPaginator } from "typeorm-cursor-pagination";


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
                          .andWhere("crm.relatedListingId = :relatedListingId", {relatedListingId: findListing?.id})
                          .getOne()
        if (!findChatRoom) {
          findChatRoom  = await ChatRoomEntity.create({
            relatedListing: findListing,
            chatName: `${findSender.email.split('@')[0]} and ${findReceiver.email.split('@')[0]}`
          }).save();
          await ChatRoomMemberEntity.create({chatRoom: findChatRoom, user: findSender}).save();
          await ChatRoomMemberEntity.create({chatRoom: findChatRoom, user: findReceiver}).save();
          setTimeout(() => {
            sendFirstMessageMail(findReceiver, findSender, findChatRoom.id, chatData.message);
          }, 1000 * 20)
        }
    }else{
      findChatRoom = await ChatRoomEntity.findOne({ where: { id: chatData.chatRoomId }, relations: ["members", "members.user", "relatedListing"] });
    }
   
    // if still we don't have any chatRoom, its probably an error
    if (!findChatRoom) throw new HttpException(409, "Chat room doesn't exist");

    const createChatMessageData = await ChatMessageEntity.create({
      chatRoom: findChatRoom, 
      content: chatData.message, 
      sender: findSender}).save();
    return createChatMessageData
  }
  public async chatRoomGet(userId: number|null, id: number|null):Promise<ChatRoom>{
      const chatRoom = await ChatRoomEntity.findOne(id, {
          relations: ["members", "relatedListing","relatedListing.media",  "members.user", "members.user.profile"],
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
                                .leftJoinAndSelect("relatedListing.media", "media")
                                .leftJoinAndSelect("members.user", "user")
                                .leftJoinAndSelect('user.profile', 'profile')
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
      // console.log(chatRooms);
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

    // console.log("chatRoomMembers", chatRoomMembers)

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
              .leftJoinAndSelect('sender.profile', 'profile')
              .leftJoinAndSelect('chat_message_entity.chatRoom', "chatRoom")
              .leftJoinAndSelect('chatRoom.members', "members")
              .leftJoinAndSelect("members.user", 'user')
              .where("chat_message_entity.chatRoomId = :id", { id: chatRoomId })
             
              // .getManyAndCount()
    let orderCondition: {paginationKeys: any; order: "DESC" | "ASC"} =
              {
                paginationKeys : ['dateSent'],
                order: "DESC"
              }
    
    // sql = sql.orderBy('chat_message_entity.id', "DESC")
    const limit: number = Math.min(30, paging.limit ?? 30);
    const paginator = buildPaginator({
      entity: ChatMessageEntity,
      paginationKeys: orderCondition.paginationKeys,
      alias:  "chat_message_entity",
      query: {
        limit: limit,
        order: orderCondition.order,
        afterCursor: paging?.starting_after ?  String(paging.starting_after) : null,
        beforeCursor: paging?.ending_before ? String(paging.ending_before) : null
      } 
    })
    
    const {data:chatMessages, cursor} = await paginator.paginate(sql);
    // console.log("messages", chatMessages[0])
    const count = chatMessages.length;
    const hasMore = chatMessages.length === limit;
    const beforeCursor = cursor.beforeCursor;
    const afterCursor = cursor.afterCursor;
    const chatMessageList: ChatMessageList = {
      items: chatMessages,
      count,
      hasMore,
      beforeCursor,
      afterCursor 
    }
    return chatMessageList;

}


}
