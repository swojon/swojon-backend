import { IsEmail, IsString, IsNotEmpty, MinLength, MaxLength } from 'class-validator';
import { InputType, Field } from 'type-graphql';
import { User } from '@typedefs/users.type';
import { Follow } from '@/typedefs/follow.type';

@InputType()
export class UpdateFollowDTO implements Partial<Follow> {
  @Field({nullable: true})
  user: User;

  @Field({nullable: true})
  followedUser: User;

}

