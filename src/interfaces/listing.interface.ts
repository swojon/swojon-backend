import { Brand } from "@/typedefs/brand.type";
import { Category } from "./category.interface";
import { Community } from "./community.interface";
import { User } from "./users.interface";
import { Location } from "./location.interface";
import { Collection } from "./collection.interface";

export interface Listing {
  id?: number;
  title?:string;
  communities?:Community[];
  brand?:Brand|null;
  user?:User;
  price?:number;
  salePrice?:number;
  location?:Location;
  latitude?:string;
  longitude?:string;
  isLive?:boolean;
  isFeatured?:boolean;
  category?:Category;
  isApproved?:boolean;
  isDeleted?:boolean;
  dateCreated?:Date;
  dateDeleted?:Date;
  isSold?:boolean;
  media?: ListingMedia[],
  videoUrl?: string;
  collections?: Collection[]
  courierDetails?: string;
  favoriteCount?:number;
  favoriteStatus?:boolean;

  options?: ProductOptionPreview[];
  variants?: ProductVariantPreview[];

}


export interface ListingMedia {
  url?:string;
  isPrimary?:boolean;
}
export interface Listings{
  items?: Listing[];
  count?: number;
  hasMore?: boolean;
  beforeCursor?:string;
  afterCursor?:string;
}

export interface ProductVariantPreview {
  id: string;
  price: number;
  quantity: number;
  media?: ListingMedia[];
  optionValues: {
    option: string;        // e.g., "Size"
    value: string;         // e.g., "Medium"
  }[];
}

export interface ProductOptionPreview {
  id: string;
  name: string;            // e.g., "Size"
  values: string[];        // e.g., ["Small", "Medium", "Large"]
}
