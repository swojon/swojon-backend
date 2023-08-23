import { Field, ObjectType } from "type-graphql";
import { Category } from "./category.type";
import { User } from "./users.type";
import { Community } from "./community.type";
import { Brand } from "./brand.type";


@ObjectType()
export class Listing {
  @Field()
  id?: number;

  @Field(()=>User)
  user?: User

  @Field()
  title?: string;

  @Field({nullable:true})
  description?: string

  @Field(()=>[Community])
  communities?: Community[]

  @Field()
  price?: number

  @Field({nullable:true})
  location?: string;

  @Field({nullable:true})
  latitude?: string;

  @Field({nullable:true})
  longitude?: string;

  @Field(()=> Category, {nullable: true})
  category?:Category

  @Field(()=> Brand, {nullable: true})
  brand?:Brand

  @Field({nullable:true})
  dateCreated?: Date

  @Field({ nullable: true})
  isFeatured?: boolean;

  @Field({ nullable: true})
  isDeleted?: boolean;

  @Field({nullable: true})
  isLive?: boolean;

  @Field({ nullable: true})
  isApproved?: boolean;

  @Field({ nullable: true})
  isSold?: boolean;

}


@ObjectType()
export class Listings {
  @Field(type => [Listing])
  items?: Listing[];

  @Field()
  count: number
}
