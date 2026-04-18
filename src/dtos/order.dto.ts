import { Status } from "@/entities/category.entity";
import { ArgsType, Field, Float, InputType, Int, registerEnumType } from "type-graphql";

@InputType()
export class OrderItemDTO {
  @Field(() => Int)
  variantId: number;

  @Field(() => Int)
  quantity: number;

  @Field(() => Float)
  price: number;
}


@InputType()
export class OrderCreateDTO {
  @Field({ nullable: true })
  email?: string;

  @Field()
  name: string;

  @Field()
  phoneNumber: string;

  @Field()
  address: string;

  @Field()
  policeStation: string;

  @Field()
  district: string;

  @Field()
  shipping: number;

  @Field(() => [OrderItemDTO])
  items: OrderItemDTO[];

  @Field({ nullable: true })
  couponCode?: string;

  @Field({ nullable: true })
  guestId?: string;
}

@ArgsType()
export class OrderArgs {
  @Field({ nullable: true})
  orderId?: string;

@Field({ nullable: true})
  status?: string;

}

enum OrderStatus {
    PENDING = "PENDING",
    PROCESSING = "PROCESSING",
    CANCELLED = "CANCELLED",
    SHIPPED = "SHIPPED",
    DELIVERED = "DELIVERED",
    PACKED = "PACKED"
}

enum PaymentStatus {
    PENDING = "PENDING",
    PAID = "PAID",
    FAILED = "FAILED",
    REFUNDED = "REFUNDED"
}

@InputType()
export class OrderUpdateDTO {

    @Field({ nullable: true })
    trackingNumber?: string;
    
    @Field({ nullable: true })
    carrier?: string;

    @Field(() => OrderStatus, { nullable: true })
    status?: OrderStatus;
    
    @Field(() => OrderStatus, { nullable: true })
    pos_invoice?: OrderStatus;
    
    @Field(() => PaymentStatus, { nullable: true })
    paymentStatus?: PaymentStatus;

    @Field({ nullable: true })
    notes?: string;
}

registerEnumType(PaymentStatus, {
  name: "PaymentStatus",
  description: "ENUM for Category Status"
})

registerEnumType(OrderStatus, {
  name: "OrderStatus",
  description: "ENUM for Order status"
})

