import { Field, NoExplicitTypeError, ObjectType } from 'type-graphql';
import { User } from './users.type';
import { Listing } from './listing.type';

@ObjectType()
export class Favorite {
  @Field()
  id?: number;

  @Field({ nullable: true})
  user?: User;

  @Field({ nullable: true})
  listing?: Listing;

  @Field()
  isDeleted?: boolean;

  @Field()
  dateCreated?: Date;

}

@ObjectType()
export class FavoriteListings {
  @Field(()=>[Listing])
  items?: Listing[];

  @Field({ nullable: true})
  count?: number;
}

@ObjectType()
export class FavoritedUsers {
  @Field(()=>[User])
  items?: User[];

  @Field({ nullable: true})
  count?: number;
}
