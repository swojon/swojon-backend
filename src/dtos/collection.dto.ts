import { Args, ArgsType, Field, InputType, registerEnumType } from "type-graphql";


@InputType()
export class CollectionCreateDTO {
    @Field()
    name: string;

    @Field()
    slug: string;

    @Field({ nullable: true})
    description?: string;

    @Field({ nullable: true})
    banner?: string;

    @Field({ nullable: true})
    icon?: string;
}

@InputType()
export class CollectionUpdateDTO {
    @Field({ nullable: true})
    name?: string;

    @Field({ nullable: true})
    slug?: string;

    @Field({ nullable: true})
    description?: string;

    @Field({ nullable: true})
    banner?: string;

    @Field({ nullable: true})
    icon?: string;
    
    @Field({ nullable: true})
    isApproved?: boolean;

    @Field({ nullable: true})
    isFeatured?: boolean;


}

@InputType()
export class CollectionRemoveDTO {
  @Field(() => [Number])
  collectionIds: number[]

}


@InputType()
export class CollectionListingInput{
  @Field()
  collectionId : number

  @Field(()=>[Number], {nullable:true})
  listingIds: number[]
}

@InputType()
export class ListingCollectionInput{
  @Field()
  listingId : number

  @Field(()=>[Number], {nullable:true})
  collectionIds: number[]
}





@ArgsType()
export class CollectionArgs {
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
  ending_before?:string;

  @Field({ nullable: true})
  starting_after?:string;

  @Field({ nullable: true})
  limit?:number;

  @Field({nullable:true})
  orderBy?: string;
}

@InputType()
export class CollectionFilterInput{
  @Field(() => [Boolean],{ nullable: true})
  isFeatured?: boolean[];

}
