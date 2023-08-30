export interface Location {
  id?: number;
  name?: string;
  slug?: string;
  description?: string;
  banner?: string;
  parentLocation?: Location;
  children?: Location[] |null;
  isLive?: boolean;
  isApproved?: boolean;
  isFeatured?: boolean;
  isSponsored?: boolean;
  isGlobal?: boolean;
}

export interface Locations {
  items?: Location[];
}
