import { IsEmail, IsString, IsNotEmpty, MinLength, MaxLength } from 'class-validator';
import { InputType, Field } from 'type-graphql';
import { User } from '@typedefs/users.type';


@InputType()
export class CreateMessageDTO {
  // @Field({nullable: true})
  // chatName: string;

  // @Field({nullable: true})
  // context: Listing;
  @Field( {nullable: true})
  chatRoomId: number;

  @Field()
  senderId: number;

  @Field()
  receiverId: number;

  @Field({nullable: true})
  message: string;

}
