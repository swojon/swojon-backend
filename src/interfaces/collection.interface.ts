import { Listing } from "./listing.interface";

export interface Collection {
    id?: number;
    slug?: string;
    isFeatured?:boolean;
    isDeleted?:boolean;
    isActive?:boolean;
    name?:string;
    description?:string;
    banner?:string;
    listings?:Listing[]
}