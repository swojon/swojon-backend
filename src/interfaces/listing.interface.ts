import { Brand } from "@/typedefs/brand.type";
import { Category } from "./category.interface";
import { Community } from "./community.interface";
import { User } from "./users.interface";
import { Location } from "./location.interface";

export interface Listing {
  id?: number;
  title?:string;
  communities?:Community[];
  brand?:Brand|null;
  user?:User;
  price?:number;
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
  media?: ListingMedia[]
}
export interface ListingMedia {
  url?:string;
  isPrimary?:boolean;
}
export interface Listings{
  items: Listing[];
  count: number;
}
