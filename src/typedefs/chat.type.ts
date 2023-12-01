import { Field, ObjectType } from "type-graphql";
import { Listing } from "./listing.type";
import { User } from "./users.type";



@ObjectType()
export class ChatRoomMember {
  @Field({ nullable: true})
  userId?: number;

  @Field({ nullable: true})
  user: User;
}


@ObjectType()
export class ChatRoom {
  @Field()
  id?: number;

  @Field({ nullable: true})
  chatName?: string;

  @Field({ nullable: true})
  isDeleted?: boolean;

  @Field(()=> [ChatRoomMember], {nullable: true})
  members?: ChatRoomMember[];

  
  @Field(() => Listing, {nullable: true})
  relatedListing?: Listing;
  
}



@ObjectType()
export class Chat {
  @Field()
  id?: number;

  @Field(()=>ChatRoom, { nullable: true})
  chatRoom: ChatRoom;

  @Field()
  sender?: User;

  @Field({nullable: true})
  content?: string;

  @Field({nullable: true})
  isDeleted?: boolean;

  @Field({nullable: true})
  dateSent?: Date;

}



@ObjectType()
export class Chats {
  @Field(()=>[Chat])
  items?: Chat[];

  @Field({ nullable: true})
  count?: number;

  @Field({nullable:true})
  hasMore?:boolean;
}


@ObjectType()
export class ChatRooms {
  @Field(()=>[ChatRoom])
  items?: ChatRoom[];

  @Field({ nullable: true})
  count?: number;
}

@ObjectType()
export class ChatRoomWithMessage {
  @Field({nullable:true})
  id?: number;

  @Field({ nullable: true})
  chatName?: string;

  @Field(()=>[Chat], { nullable: true})
  messages?: Chat[];

  @Field(() => Listing, {nullable: true} )
  relatedListing?: Listing;
  
  @Field({ nullable: true})
  isDeleted?: boolean;
  
  @Field(()=> [ChatRoomMember], {nullable: true})
  members?: ChatRoomMember[];
}

@ObjectType()
export class ChatRoomsWithMessage {
  @Field(()=>[ChatRoomWithMessage])
  items?: ChatRoomWithMessage[];

  @Field({ nullable: true})
  count?: number;
}
