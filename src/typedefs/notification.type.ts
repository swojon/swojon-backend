import { Field, ObjectType } from "type-graphql";
import { User } from "./users.type";
import { NotificationType } from "@/entities/notification.entity";

@ObjectType()
export class Notification {
  @Field()
  id?: number;

  @Field(()=>User)
  user?: User

  @Field()
  content?: string;

  @Field(() => NotificationType, {nullable:true})
  type?: NotificationType;

  @Field({nullable:true})
  dateCreated?: Date

  @Field({ nullable: true})
  read?: boolean;

  @Field(() => Object, {nullable:true})
  context?: Record<string, any> | null;;
  
  
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
