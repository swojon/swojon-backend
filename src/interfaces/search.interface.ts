import { Status } from "@/entities/category.entity";
import { User } from "./users.interface";

export interface Search {
  id?: number;
  searchQuery?: string;
  isSaved?: boolean;
  user?: User;
  title?: string;
}

export interface Searches {
  items?: Search[];
  hasMore?:boolean;
  count?:number;
}

export interface TrendingSearches {
    items: {searchQuery : string}[]
}