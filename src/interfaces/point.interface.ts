import { User } from "./users.interface";
import { TRANSACTION_TYPE } from "@/entities/points.entity";

export interface Point {
  id?: number;
  user:User;
  amount: number;
  description: string;
  consumed?: number;
  expireAt:Date;
  isPlus:boolean;
  isBlocked?:boolean;
  dateCreated?:Date;
  dateUpdated?:Date;
  type?:TRANSACTION_TYPE;
}

export interface Points {
  items?: Point[];
  hasMore?:boolean;
}
