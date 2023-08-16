export interface Category {
  id?: number;
  name?: string;
  slug?: string;
  description?: string;
  banner?: string;
  parentCategory?: Category;
  children?: Category[] |null;
  isLive?: boolean;
  isApproved?: boolean;
  isFeatured?: boolean;
  isSponsored?: boolean;
  isGlobal?: boolean;
}

export interface Categories {
  items?: Category[];
}
