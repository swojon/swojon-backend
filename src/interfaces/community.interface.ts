import { Location } from "./location.interface";
import { User } from "./users.interface";

export interface Community {
  id?: number;
  name?: string;
  slug?:string;
  latitude?: string;
  longitude?:string;
  description?: string;
  banner?:string;
  isLive?:boolean;
  isFeatured?:boolean;
  isDeleted?: boolean;
  location?:Location;
  memberCount?: number;
  members?:CommunityMember[];
  memberStatus?: boolean;
}

export interface Communities {
  items?: Community[];
  count?: number;
}

export interface CommunityMember {
  id?: number;
  community?: Community;
  user?: User;
  isDeleted?: boolean;
  dateJoined?: Date;
}

export interface CommunityMembers {
  members?: CommunityMember[];
  count?: number;
}

export interface MemberCommunityList {
  items?: CommunityMember[];
  count?: number;
}
