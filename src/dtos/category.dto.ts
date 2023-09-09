import { Status } from "@/entities/category.entity";
import { ArgsType, Field, InputType, registerEnumType } from "type-graphql";

registerEnumType(Status, {
  name: "Status",
  description: "ENUM for Category Status"
})

@InputType()
export class CategoryCreateDTO {
    @Field()
    name: string;

    @Field()
    slug: string;

    @Field({ nullable: true})
    description?: string;

    @Field({ nullable: true})
    banner?: string;

    @Field({ nullable: true})
    parentCategoryId?: number;
}

@InputType()
export class CategoryUpdateDTO {
    @Field({ nullable: true})
    name?: string;

    @Field({ nullable: true})
    slug?: string;

    @Field({ nullable: true})
    description?: string;

    @Field({ nullable: true})
    banner?: string;

    @Field({ nullable: true})
    parentCategoryId?: number;

    @Field(type=>Status, { nullable: true})
    status?: Status;

    @Field({ nullable: true})
    isApproved?: boolean;

    @Field({ nullable: true})
    isFeatured?: boolean;

    @Field({ nullable: true})
    isSponsored?: boolean;

    @Field({ nullable: true})
    isGlobal?: boolean;

}

@InputType()
export class CategoryRemoveDTO {
  @Field(() => [Number])
  categoryIds: number[]

}

@ArgsType()
export class CategoryArgs {
  @Field({ nullable: true})
  id?: number;

  @Field({ nullable: true})
  name?: string;

  @Field({ nullable: true})
  slug?: string;
}

@ArgsType()
export class PagingArgs{
  @Field({ nullable: true})
  ending_before?:number;

  @Field({ nullable: true})
  starting_after?:number;

  @Field({ nullable: true})
  limit?:number;
}
