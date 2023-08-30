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

  @Field(()=> [Location], {nullable: true})
  children?:Location[]

  @Field({ nullable: true})
  isLive?: boolean;

  @Field({ nullable: true})
  isApproved?: boolean;

  @Field({ nullable: true})
  isFeatured?: boolean;

  @Field({ nullable: true})
  isSponsored?: boolean;

  @Field({ nullable: true})
  isGlobal?: boolean;

}


@ObjectType()
export class Locations {
  @Field(type => [Location])
  items?: Location[];
}
