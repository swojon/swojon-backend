import { User } from "./users.interface";

export interface Follow {
  id?:number|null;
  user?: User|null;
  followedUser?:User|null;
  isDeleted?:boolean|null;
  dateFollowed?:Date|null;
}

export interface Following {
  user?:User|null;
}
