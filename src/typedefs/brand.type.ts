import { Field, ObjectType } from "type-graphql";
import { Category } from "./category.type";


@ObjectType()
export class Brand {
  @Field()
  id?: number;

  @Field()
  name?: string;

  @Field({ nullable: true})
  slug?: string;

  @Field({ nullable: true})
  description?: string;

  @Field({ nullable: true})
  logo?: string;

  @Field(()=> [Category], {nullable: true})
  categories?:Category[]

  @Field({ nullable: true})
  isFeatured?: boolean;

  @Field({ nullable: true})
  isDeleted?: boolean;

}


@ObjectType()
export class Brands {
  @Field(type => [Brand])
  items?: Brand[];

  @Field()
  hasMore?: boolean
}
