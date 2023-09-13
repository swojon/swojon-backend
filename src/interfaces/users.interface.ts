import { Community } from './community.interface';
import { Profile } from './profile.interface';
import { Role } from './role.interface';

export interface User {
  id?: number;
  email?: string;
  username?:string;
  facebookId?: string;
  password?: string;
  isApproved: boolean;
  isStaff: boolean;
  isEmailVerified: boolean;
  profile: Profile;
  roles: Role[];
  createdAt?: Date;

}

export interface UserWithMeta {
  id?: number;
  email?: string;
  username?:string;
  facebookId?: string;
  password: string;
  isApproved: boolean;
  isStaff: boolean;
  isEmailVerified: boolean;
  profile: Profile;
  roles: Role[];

  createdAt: Date;
  followerCount?: number
  followingCount?: number;
  listingCount?: number;
  communities?: Community[]
}

