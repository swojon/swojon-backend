import { InputType, Field } from "type-graphql";

@InputType()
export class NotificationFilterInput {
  @Field(() => [Boolean],{ nullable: true})
  unreadOnly?: boolean[];

}