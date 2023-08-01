import { User } from "./users.interface";


export interface Follower {
  items?: User[];
  count?: number | null;
}
