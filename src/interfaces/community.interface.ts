import { User } from "./users.interface";

export interface Community {
  id?: number;
  name?: string;
  description?: string;
  isDeleted?: boolean;
  dateCreated?: Date;
  dateUpdated?: Date;
  createdBy?: User;
  updatedBy?: User;
  memberCount?: number;
  members?:CommunityMember[];
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
