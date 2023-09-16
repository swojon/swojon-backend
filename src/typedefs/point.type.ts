import { Field, ObjectType, registerEnumType } from "type-graphql";
import { User } from "./users.type";
import { TRANSACTION_TYPE } from "@/entities/points.entity";

registerEnumType(TRANSACTION_TYPE, {
  name: "TRANSACTION_TYPE",
  description: "ENUM for point Transaction Type"
})

@ObjectType()
export class Point {
  @Field()
  id?: number;

  @Field(() => TRANSACTION_TYPE,)
  type?: TRANSACTION_TYPE;

  @Field(() => User)
  user: User;

  @Field()
  amount : number

  @Field()
  consumed?: number

  @Field()
  expireAt: Date

  @Field()
  isBlocked?: boolean;

  @Field()
  description?: string;

  @Field()
  isPlus: boolean;

}

@ObjectType()
export class Points {
  @Field(type => [Point])
  items?: Point[];

  @Field({nullable:true})
  hasMore?:boolean;

}
