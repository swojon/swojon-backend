import { Field, ObjectType } from 'type-graphql';
import { User } from './users.type';

@ObjectType()
export class TokenData {
  @Field()
  token: string;

  @Field()
  expiresIn: number;

}

@ObjectType()
export class TokenUserData extends User {
  @Field()
  token: string;

  @Field()
  expiresIn: number;
}

@ObjectType()
export class SocialAuthInput {
  @Field()
  accessToken: string;
}
