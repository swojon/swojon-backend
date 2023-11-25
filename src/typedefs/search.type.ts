import { Field, ObjectType } from 'type-graphql';
import { User } from './users.type';

@ObjectType()
export class Search {
  @Field()
  id?: number;

  @Field()
  searchQuery?: string;

  @Field({nullable:true})
  isSaved?: boolean;

  @Field(() => User, {nullable:true})
  user?:User;

  @Field({nullable:true})
  title?: string;

}


@ObjectType()
export class Searches {
  @Field(type => [Search])
  items?: Search[];

  @Field({nullable:true})
  count?: number

  @Field({nullable:true})
  hasMore?: boolean
}

@ObjectType()
export class SearchQuery{
    @Field()
    searchQuery: string
}
@ObjectType()
export class SearchQueries {
    @Field(type => [SearchQuery])
    items: SearchQuery[]

}

@ObjectType()
export class TrendingSearches {
    @Field(type => [SearchQuery])
    items: SearchQuery[]

}