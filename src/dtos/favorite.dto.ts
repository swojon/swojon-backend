import { Field, InputType } from "type-graphql";

@InputType()
export class FavoriteCreateUpdateDTO {
  @Field()
  userId: number;

  @Field()
  listingId: number

}
