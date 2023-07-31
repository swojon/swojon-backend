import { Profile } from './profile.interface';
import { Role } from './role.interface';

export interface User {
  id?: number;
  email?: string;
  facebookId?: string;
  password: string;
  isApproved: boolean;
  isStaff: boolean;
  isEmailVerified: boolean;
  profile: Profile;
  roles: Role[];
}
