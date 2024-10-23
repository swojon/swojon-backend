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
  passwordResetToken?:string;
  passwordResetTokenExpiresAt?:Date;
}

export interface ResetStatus {
  success?: boolean;
}

export interface UserWithMeta extends User {
  createdAt?: Date;
  followerCount?: number
  followingCount?: number;
  followingStatus?: boolean;
  listingCount?: number;
  pointBalance?:number;
  communities?: Community[]
}

