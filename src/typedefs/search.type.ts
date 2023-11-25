import { Field, ObjectType } from 'type-graphql';
import { User } from './users.type';

@ObjectType()
export class Search {
  @Field()
  id?: number;

  @Field()
  searchQuery?: string;

  @Field()
  isSaved?: boolean;

  @Field(() => User, {nullable:true})
  user?:User;

  @Field()
  title?: string;

}


@ObjectType()
export class Searches {
  @Field(type => [Search])
  items?: Search[];

  @Field()
  count?: number

  @Field()
  hasMore?: boolean
}

@ObjectType()
export class SearchQuery{
    @Field()
    searchQuery: string
}

@ObjectType()
export class TrendingSearches {
    @Field(type => [SearchQuery])
    items: SearchQuery[]

}