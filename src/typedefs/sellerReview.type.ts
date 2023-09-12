import { Field, Float, ObjectType } from "type-graphql";
import { User } from "./users.type";
import { Listing } from "./listing.type";


@ObjectType()
export class Review {
  @Field()
  id?: number;

  @Field(()=>User)
  reviewer?: User

  @Field(()=>User)
  seller?: User

  @Field(()=>Listing)
  listing?: Listing

  @Field({nullable:true})
  review?: string;

  @Field(type=>Float)
  rating?: number

  @Field()
  dateCreated?: Date

  @Field()
  isDeleted?: boolean;

}


@ObjectType()
export class Reviews {
  @Field(type => [Review])
  items?: Review[];

  @Field()
  count?: number
}
