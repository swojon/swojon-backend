export interface Location {
  id?: number;
  name?: string;
  slug?: string;
  description?: string;
  banner?: string;
  parentLocation?: Location;
  isFeatured?: boolean;
  isDeleted?: boolean;
  isLive?: boolean;
}

export interface Locations {
  items?: Location[];
}
