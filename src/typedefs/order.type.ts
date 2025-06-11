import { ObjectType, Field, Int, Float } from "type-graphql";
import { GraphQLJSONObject } from 'graphql-type-json';
import { Listing, ProductVariant } from "./listing.type";

@ObjectType()
export class Order {
  @Field(() => Int)
  id: number;

  @Field(()=> Date)
  createdAt: Date;

  @Field(() => GraphQLJSONObject)
  shippingAddress: any;

  @Field()
  status: string;

  @Field(() => Float)
  totalAmount: number;
   @Field(() => Float)
  finalAmount: number;
  
  @Field(() => Float)
  shipping: number;
  
  @Field({ nullable: true })
  couponCode?: string;

  @Field(() => [OrderItem])
  items: OrderItem[];
}

@ObjectType()
export class OrderItem {
  
  @Field(() => ProductVariant, {nullable: true})
  variant?: ProductVariant;

  @Field(() => Listing, {nullable: true})
  listing?: Listing;

  @Field(() => Int)
  quantity: number;

  @Field(() => Float)
  price: number;
}


@ObjectType()
export class Orders {
  @Field(type => [Order])
  items?: Order[];

  @Field({nullable:true})
  count?: number

  @Field()
  hasMore?: boolean

  @Field({nullable:true})
  beforeCursor?:string;

  @Field({nullable:true})
  afterCursor?:string;
}
