import { Listing } from "./listing.interface";
import { User } from "./users.interface";

export interface Favorite {
  id?:number|null;
  user?: User|null;
  listing?:Listing|null;
  isDeleted?:boolean|null;
  dateCreated?:Date|null;
  dateUpdated?:Date|null;
}

export interface FavoriteListings {
  items?: Listing[];
  count?: number | null;
}

export interface FavoritedUsers {
  items?: User[];
  count?: number | null;
}
