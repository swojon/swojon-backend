import { User } from "./users.interface";


export interface Followers {
  items?: Follower;
  count?: number | null;
}

export interface Follower {
  user: User,
  followStatus?: boolean;
}