import { NotificationType } from "@/entities/notification.entity";
import { User } from "./users.interface";

export interface Notification {
    id?:number;
    read?:boolean;
    user?:User;
    userId?:number;
    content?:string;
    context?:any;
    type?: NotificationType;
    dateCreated?: Date;
}

export interface Notifications {
  items?:Notification[];
  count?: number;
  hasMore?: boolean;
}
