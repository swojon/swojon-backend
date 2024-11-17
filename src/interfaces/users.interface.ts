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
  isAdmin: boolean;

  isEmailVerified: boolean;
  isBanned: boolean;
  isLocked: boolean;
  isSuspended: boolean;
  isVerified: boolean;
  isModerator: boolean;
  profile: Profile;
  roles: Role[];
  createdAt?: Date;
  passwordResetToken?:string;
  passwordResetTokenExpiresAt?:Date;
  emailVerificationToken?:string;
  emailVerificationTokenExpiresAt?:Date;
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

