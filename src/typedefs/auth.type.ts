import { Field, ObjectType } from 'type-graphql';

@ObjectType()
export class TokenData {
  @Field()
  token: string;

  @Field()
  expiresIn: number;

}
