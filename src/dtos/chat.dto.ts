import { IsEmail, IsString, IsNotEmpty, MinLength, MaxLength } from 'class-validator';
import { InputType, Field, ArgsType } from 'type-graphql';
import { User } from '@typedefs/users.type';


@InputType()
export class CreateMessageDTO {
  @Field( {nullable: true})
  chatRoomId: number;

  @Field({nullable: true})
  senderId?: number;

  @Field({nullable: true})
  receiverId?: number;

  @Field({nullable: true})
  message: string;

  @Field({nullable: true})
  relatedListingId?: number;
  
}

// @InputType()
// export class CreateMessageSessionDTO{
//   @Field( {nullable: true})
//   chatRoomId: number;

//   @Field()
//   senderId: number;

//   @Field({nullable: true})
//   message: string;
// }


@ArgsType()
export class ListChatRoomArgs {
  @Field({ nullable: true})
  id?: number;

  @Field({ nullable: true})
  userId?: number;

}
