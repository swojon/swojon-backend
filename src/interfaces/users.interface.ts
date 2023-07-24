import { Profile } from './profile.interface';

export interface User {
  id?: number;
  email?: string;
  password: string;
  isApproved: boolean;
  isStaff: boolean;
  isEmailVerified: boolean;
  profile: Profile;
}
