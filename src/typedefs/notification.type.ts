import { Field, ObjectType } from "type-graphql";
import { User } from "./users.type";
import { NotificationType } from "@/entities/notification.entity";

@ObjectType()
export class ContextType {
  @Field({nullable: true})
  userId: number;

  @Field({nullable: true})
  listingId: number;
  
  @Field({nullable: true})
  messageId: number;
  
}
@ObjectType()
export class Notification {
  @Field()
  id?: number;

  @Field(()=>User)
  user?: User

  @Field({nullable:true})
  userId?: number;

  @Field()
  content?: string;

  @Field(() => String, {nullable:true})
  type?: NotificationType;

  @Field({nullable:true})
  dateCreated?: Date

  @Field({ nullable: true})
  read?: boolean;

  @Field({nullable:true})
  context?: string;
  
  
}


@ObjectType()
export class Notifications {
  @Field(type => [Notification])
  items?: Notification[];

  @Field()
  count?: number

  @Field()
  hasMore?: boolean
}
