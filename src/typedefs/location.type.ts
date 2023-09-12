import { Field, ObjectType } from "type-graphql";


@ObjectType()
export class Location {
  @Field()
  id?: number;

  @Field()
  name?: string;

  @Field({ nullable: true})
  slug?: string;

  @Field({ nullable: true})
  description?: string;

  @Field({ nullable: true})
  banner?: string;

  @Field({ nullable: true})
  parentLocation?:Location;

  @Field({ nullable: true})
  isDeleted?: boolean;

  @Field({ nullable: true})
  isFeatured?: boolean;

  @Field({ nullable: true})
  isLive?: boolean;

}


@ObjectType()
export class Locations {
  @Field(type => [Location])
  items?: Location[];
}
