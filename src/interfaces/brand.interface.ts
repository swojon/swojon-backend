import { Category } from "./category.interface";

export interface Brand {
  id?: number;
  name?:string;
  slug?:string;
  description?:string;
  logo?:string;
  isFeatured?:boolean;
  isDeleted?:boolean;
  categories?:Category[];
}

export interface Brands{
  items: Brand[];
  hasMore?:boolean;
}
