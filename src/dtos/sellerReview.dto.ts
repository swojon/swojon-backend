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
export class SellerReviewCreateDTO {
  @Field()
  reviewerId: number;

  @Field({nullable:true})
  listingId?: number;

  @Field({nullable:true})
  review?: string;

  @Field({nullable:true})
  sellerId: number;

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

@InputType()
export class ReviewFilterInput{
  @Field(() => [Number],{ nullable: true})
  stars?: number[];

}
