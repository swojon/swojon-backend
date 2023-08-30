import { ArgsType, Field, InputType } from "type-graphql";


@InputType()
export class LocationCreateDTO {
    @Field()
    name: string;

    @Field()
    slug: string;

    @Field({ nullable: true})
    description?: string;

    @Field({ nullable: true})
    banner?: string;

    @Field({ nullable: true})
    parentLocationId?: number;
}

@InputType()
export class LocationUpdateDTO {
    @Field({ nullable: true})
    name?: string;

    @Field({ nullable: true})
    slug?: string;

    @Field({ nullable: true})
    description?: string;

    @Field({ nullable: true})
    banner?: string;

    @Field({ nullable: true})
    parentLocationId?: number;

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
export class LocationArgs {
  @Field({ nullable: true})
  id?: number;

  @Field({ nullable: true})
  name?: string;

  @Field({ nullable: true})
  slug?: string;
}
