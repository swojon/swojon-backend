import { Status } from "@/entities/category.entity";
import { Field, ObjectType, registerEnumType } from "type-graphql";


registerEnumType(Status, {
  name: "Status",
  description: "ENUM for Category Status"
})

@ObjectType()
export class Category {
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
  parentCategory?:Category;

  @Field(()=> [Category], {nullable: true})
  children?:Category[]

  @Field(type=>Status, { nullable: true})
  status?: Status ;

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
export class Categories {
  @Field(type => [Category])
  items?: Category[];

  @Field({nullable:true})
  hasMore?:boolean;

}
