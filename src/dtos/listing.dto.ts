import { Field, InputType } from "type-graphql";

@InputType()
export class ListingCreateDTO {
  @Field()
  title: string;

  @Field({nullable: true})
  description?: string;

  @Field(()=>[Number], {nullable:true})
  communityIds?:number[]

  @Field()
  price:number

  @Field({nullable:true})
  locationId?: number;

  @Field({nullable:true})
  latitude?: string;

  @Field({nullable:true})
  longitude?: string;

  @Field()
  categoryId : number

  @Field({nullable:true})
  brandId?: number

  @Field(()=>[String], {nullable:true})
  mediaUrls?: string[]

}

@InputType()
export class ListingUpdateDTO{
  @Field({nullable: true})
  title?: string;

  @Field({nullable: true})
  description?: string;

  @Field(()=>[Number], {nullable: true})
  communityIds?:number[]

  @Field({nullable:true})
  price?:number

  @Field({nullable:true})
  location?: string;

  @Field({nullable:true})
  latitude?: number;

  @Field({nullable:true})
  longitude?: number;

  @Field({nullable:true})
  categoryId? : number

  @Field({nullable:true})
  brandId?: number

}

@InputType()
export class ListingMediaCreateDTO{
  @Field()
  brandId : number

  @Field(()=>[Number], {nullable:true})
  categoryIds: number[]

}



@InputType()
export class ListingCommunityInputDTO{
  @Field()
  listingId : number

  @Field(()=>[Number], {nullable:true})
  communityIds: number[]

}

@InputType()
export class SerachInputDTO {
  @Field()
  search: string;
}

@InputType()
export class ListingFilterInput{
  @Field(() => [Boolean],{ nullable: true})
  isFeatured?: boolean[];

  @Field(() => [Number],{ nullable: true})
  userIds?: number[];

  @Field({nullable:true})
  locationId?: number;
 
  @Field(() => [Number],{ nullable: true})
  communityIds?: number[];
  
  @Field({nullable:true})
  communitySlug?: string; 

  @Field(() => [Number],{ nullable: true})
  brandIds?: number[];

  @Field({nullable:true})
  brandSlug: string; 

  @Field(() => [Number],{ nullable: true})
  categoryIds?: number[];

  @Field(() => [Number],{ nullable: true})
  locationIds?: number[];

  @Field(() => [String], {nullable:true})
  categorySlug? : string[];  
}
