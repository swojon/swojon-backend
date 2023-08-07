import { Field, ObjectType } from "type-graphql";
import { User } from "./users.type";


@ObjectType()
export class ChatRoom {
  @Field()
  id?: number;

  @Field({ nullable: true})
  chatName?: string;

  // @Field({ nullable: true})
  // context?: string;

  @Field({ nullable: true})
  isDeleted?: boolean;
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
}


@ObjectType()
export class ChatRooms {
  @Field(()=>[ChatRoom])
  items?: ChatRoom[];

  @Field({ nullable: true})
  count?: number;
}
