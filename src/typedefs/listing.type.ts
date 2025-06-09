import { Field, ObjectType } from "type-graphql";
import { Category } from "./category.type";
import { User } from "./users.type";
import { Community } from "./community.type";
import { Brand } from "./brand.type";
import { Collection } from "./collections.type";

@ObjectType()
export class ListingMedia {
  @Field()
  url?: string;

  @Field()
  isPrimary?: boolean;

}

@ObjectType()
export class ProductOptionValue {
  @Field({ nullable: true })
  optionName: string;

  @Field({ nullable: true })
  value: string;
}

@ObjectType()
export class ProductVariant {
  @Field()
  id: number;
  
  @Field({ nullable: true })
  sku?: string;

  @Field()
  price: number;

  @Field({ nullable: true })
  salePrice?: number;

  @Field({ nullable: true })
  stock: number;

  @Field(() => [ListingMedia], { nullable: true })
  media?: ListingMedia[];

  @Field(() => [ProductOptionValue])
  optionValues: ProductOptionValue[];
}

@ObjectType()
export class ProductOption {
  @Field()
  id: number;

  @Field()
  name: string;

  @Field(() => [String])
  values: string[];
}


@ObjectType()
export class Listing {
  @Field()
  id?: number;

  @Field(()=>User)
  user?: User

  @Field()
  title?: string;

  @Field({nullable:true})
  description?: string

  @Field(()=>[Community])
  communities?: Community[]

  @Field(()=>[ListingMedia], {nullable:true})
  media?: ListingMedia[]

  @Field()
  price?: number

  @Field({nullable:true})
  salePrice?: number;


  @Field({nullable:true})
  dealingMethod?: string;

  @Field({nullable:true})
  courierDetails?: string;

  @Field({nullable:true})
  stock?: number;

  @Field({nullable:true})
  slug?: string;

  @Field({nullable:true})
  condition?: string;

  @Field(()=> Category, {nullable: true})
  category?:Category

  @Field(()=> [Collection], {nullable: true})
  collections?:Collection[] 

  @Field(()=> Brand, {nullable: true})
  brand?:Brand

  @Field({nullable:true})
  dateCreated?: Date;

  @Field({nullable:true})
  datePublished?: Date;
  
  @Field({ nullable: true})
  isFeatured?: boolean;

  @Field({ nullable: true})
  isDeleted?: boolean;

  @Field({nullable:true})
  deleteReason?: string;

  @Field({nullable: true})
  isLive?: boolean;

  @Field({ nullable: true})
  isApproved?: boolean;

  @Field({ nullable: true})
  isAvailable?: boolean;

  @Field({ nullable: true})
  isSold?: boolean;

  @Field({nullable: true})
  favoriteCount?: number;

  @Field({nullable: true})
  favoriteStatus?: boolean;

  @Field({nullable:true})
  status?:string;

  @Field({nullable: true})
  videoUrl?: string;

  @Field(() => [ProductOption], { nullable: true })
  options?: ProductOption[];

  @Field(() => [ProductVariant], { nullable: true })
  variants?: ProductVariant[];
}


@ObjectType()
export class Listings {
  @Field(type => [Listing])
  items?: Listing[];

  @Field({nullable:true})
  count?: number

  @Field()
  hasMore?: boolean

  @Field({nullable:true})
  beforeCursor?:string;

  @Field({nullable:true})
  afterCursor?:string;
}

@ObjectType()
export class Sitemap {
  @Field()
  url: string;

  @Field({nullable:true})
  lastmod?: Date;

  @Field({nullable:true})
  changefreq?: string;

  @Field({nullable:true})
  priority?: number;
}

@ObjectType()
export class SitemapLists {
  @Field(() => [Sitemap])
  items?: Sitemap[];
}


