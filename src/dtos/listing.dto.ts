import { Field, InputType } from "type-graphql";


@InputType()
export class NominatimLocationInput {
  @Field({nullable:true})
  lat?: string 

  @Field({nullable:true})
  lon?: string 
  
  @Field({nullable:true})
  placeId?: string 
  
  @Field({nullable:true})
  locality?: string
  
  @Field({nullable:true})
  displayName?: string 
  
  @Field({nullable:true})
  city?: string
  
  @Field({nullable:true})
  stateDistrict?: string
  
  @Field({nullable:true})
  state ?: string
  
  @Field({nullable:true})
  country?: string
  
  @Field({nullable:true})
  postCode?: string
}
@InputType()
export class ListingCreateDTO {
  @Field()
  title: string;

  @Field({nullable: true})
  description?: string;

  
  @Field(()=>[String], {nullable:true})
  mediaUrls?: string[]

  @Field({nullable:true})
  slug?: string;
  
  @Field({nullable: true})
  condition?: string;

  @Field({nullable:true})
  brandId?: number;

  @Field()
  categoryId: number

  @Field({nullable:true})
  quantity?: number;

  @Field({nullable:true, defaultValue: "meetup"})
  dealingMethod?: string;

  @Field()
  price: number;
  
  @Field({nullable:true})
  deliveryCharge?: number;

  @Field(() => [NominatimLocationInput], {nullable:true})
  meetupLocations?: NominatimLocationInput[]

  
}

@InputType()
export class ListingUpdateDTO{
  @Field({nullable: true})
  title?: string;

  @Field({nullable: true})
  description?: string;

  @Field({nullable:true})
  price?:number

  @Field(() => [NominatimLocationInput], {nullable:true})
  meetupLocations?: NominatimLocationInput[]
  
  @Field(()=>[String], {nullable:true})
  mediaUrls?: string[]

  @Field({nullable: true})
  condition?: string;
  
  @Field({nullable:true})
  categoryId? : number

  @Field({nullable:true})
  brandId?: number

  @Field({nullable:true})
  isAvailable?: boolean;

  @Field({nullable:true})
  deleteReason?: string;

  @Field({nullable:true})
  isDeleted?: boolean;

  @Field({nullable:true})
  isSold?: boolean;

  @Field({nullable:true})
  isSoldHere?: boolean;
  
}

@InputType()
export class AdminListingUpdateDTO{
  
  @Field({nullable: true})
  rejectReason?: string;

  @Field({nullable: true})
  status?: string;
  
  @Field({nullable:true})
  isAvailable?: boolean;

  @Field({nullable:true})
  deleteReason?: string;

  @Field({nullable:true})
  isDeleted?: boolean;
}

@InputType()
export class MarkAsUnavailableDTO {
    
  @Field({defaultValue:true})
  isAvailable: boolean;

  @Field({nullable:true})
  isRelist?:boolean;

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

  @Field({nullable: true})
  status?: string;
}
