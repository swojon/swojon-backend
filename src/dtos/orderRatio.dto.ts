import { InputType, Field } from "type-graphql";

@InputType()
export class OrderRatioCheckDTO {
  @Field({nullable:true})
  phone?: string;
  
}