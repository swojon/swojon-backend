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
export class Follower{
  @Field()
  id?: number;
  
  @Field(() => User)
  user? : User;

  @Field()
  followStatus?: boolean;
}
@ObjectType()
export class Followers {
  @Field(()=>[Follower])
  items?: Follower[];

  @Field({ nullable: true})
  count?: number;
}
