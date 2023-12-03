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

@ObjectType()
export class SummaryReview{
  @Field({nullable:true})
  avgRating?: number;

  @Field({nullable:true})
  reviewCount?: number;

  @Field({nullable:true})
  five_star_count?: number;
  
  @Field({nullable:true})
  four_star_count?: number;
  
  @Field({nullable:true})
  three_star_count?: number;
  
  @Field({nullable:true})
  two_star_count?: number;
  
  @Field({nullable:true})
  one_star_count?: number;

}