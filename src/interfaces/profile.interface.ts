import { User } from "./users.interface";

export interface Profile {
  id?: number;
  name?: string | null;
  phoneNumber?: string| null;
  isPhoneNumberVerified?: boolean;
  address?: string| null;
  city?: string| null;
  state?: string| null;
  zipCode?: string| null;
  country?: string| null;
  facebookHandle?: string| null;
  twitterHandle?: string| null;
  instagramHandle?: string| null;
  linkedinHandle?: string| null;
  googleHandle?: string| null;
  avatar?: string | null;
  avatarThumbnail?: string| null;
}
