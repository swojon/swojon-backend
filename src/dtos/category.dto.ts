import { ArgsType, Field, InputType } from "type-graphql";


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


@ArgsType()
export class CategoryArgs {
  @Field({ nullable: true})
  id?: number;

  @Field({ nullable: true})
  name?: string;

  @Field({ nullable: true})
  slug?: string;
}
