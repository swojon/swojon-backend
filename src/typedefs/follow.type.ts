import { Field, NoExplicitTypeError, ObjectType } from 'type-graphql';
import { User } from './users.type';

@ObjectType()
export class Follow {
  @Field()
  id?: number;

  @Field({ nullable: true})
  user?: User;

  @Field({ nullable: true})
  followedUser?: User;

  @Field()
  isDeleted?: boolean;

  @Field()
  dateFollowed?: Date;

}

@ObjectType()
export class Followers {
  @Field(()=>[User])
  items?: User[];

  @Field({ nullable: true})
  count?: number;
}
