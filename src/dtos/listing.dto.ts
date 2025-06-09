import { IsArray, IsOptional } from "class-validator";
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
export class ProductOptionValueDTO {
  @Field({nullable:false})
  value: string;  // e.g., "Small", "Red"

  @Field({nullable:false})
  optionName: string; // e.g., "Size", "Color"
}

@InputType()
export class ProductOptionDTO {
  @Field({nullable:false})
  name: string; // e.g., "Size", "Color"

  @Field(() => [String], {nullable:true})
  values: string[]; // e.g., ["Small", "Medium", "Large"]
}

@InputType()
export class ProductVariantDTO {
  @Field({nullable:false})
  price: number; // e.g., 19.99

  @Field({nullable:false})
  salePrice: number; // e.g., 15.99

  @Field({nullable:false})
  stock: number; // e.g., 100

  @Field()
  sku: string; // e.g., "SKU12345"

  @Field(()=>[String], {nullable:true})
  mediaUrls?: string[]

  @Field(() => [ProductOptionValueDTO], {nullable:true})
  optionValues: ProductOptionValueDTO[]; // e.g., ["Red", "XL"]
} 


@InputType()
export class ListingCreateDTO {
  @Field()
  title: string;

  @Field({nullable: true})
  sku?: string;

  @Field({nullable: true})
  stock?: number;

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

  @Field()
  price: number;

  @Field({nullable:true})
  salePrice?: number;

  @Field({nullable: true})
  videoUrl?: string;

  @Field(() => [ProductOptionDTO], { nullable: true })
  options?: ProductOptionDTO[];  // List of options like Size, Color, etc.

  @Field(() => [ProductVariantDTO], { nullable: true })
  variants?: ProductVariantDTO[]; 
  
  // @Field({nullable:true})
  // courierDetails?: string;

  // @Field(() => [NominatimLocationInput], {nullable:true})
  // meetupLocations?: NominatimLocationInput[]

  
}

@InputType()
export class ListingUpdateDTO{
 @Field()
  title: string;

  @Field({nullable: true})
  sku?: string;

  @Field({nullable: true})
  stock?: number;
  
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

  @Field()
  price: number;

  @Field({nullable:true})
  salePrice?: number;

  @Field({nullable: true})
  videoUrl?: string;

  @Field(() => [ProductOptionDTO], { nullable: true })
  options?: ProductOptionDTO[];  // List of options like Size, Color, etc.

  @Field(() => [ProductVariantDTO], { nullable: true })
  variants?: ProductVariantDTO[]; 
  
  @Field({nullable:true})
  isDeleted?: boolean;

  @Field({nullable:true})
  deleteReason?: string;

  @Field({nullable:true})
  isAvailable?: boolean;
  
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

  @Field(() => [Number],{ nullable: true})
  collectionIds?: number[];
 
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

  @Field(() => [String], {nullable:true})
  collectionSlug? : string[];  

  @Field({nullable: true})
  status?: string;
}
