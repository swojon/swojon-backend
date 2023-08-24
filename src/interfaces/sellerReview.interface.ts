import { Listing } from "./listing.interface";
import { User } from "./users.interface";

export interface Review {
  id?:number|null;
  reviewer?: User|null;
  seller?:User|null;
  listing?:Listing|null;
  review?:string|null;
  rating?:number|null;
  isDeleted?:boolean|null;
  dateCreated?:Date|null;
  dateUpdated?:Date|null;
}

export interface Reviews {
  items?: Review[];
  count?: number | null;
}

