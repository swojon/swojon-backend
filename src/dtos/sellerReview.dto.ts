import { Field, InputType, Float } from "type-graphql";

@InputType()
export class ReviewCreateDTO {
  @Field()
  reviewerId: number;

  @Field()
  listingId: number;

  @Field({nullable:true})
  review?: string;

  @Field(type=>Float)
  rating: number
}

@InputType()
export class ReviewUpdateDTO{

  @Field({nullable:true})
  review?: string;

  @Field(type=>Float)
  rating: number
}