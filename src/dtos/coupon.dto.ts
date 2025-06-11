import { Coupon } from "@/typedefs/coupon.type";
import { Field, InputType } from "type-graphql";

@InputType()
export class CouponCreateDTO implements Partial<Coupon> {
    @Field()
    code : string;

    @Field()
    discountAmount: number;

    @Field({nullable: true})
    isPercantage?: boolean;

    @Field({nullable: true})
    minimumPurchaseAmount?: number;

    @Field({nullable: true})
    expiresAt?: Date;

    @Field({ nullable: true })
    maxUses?: number; // e.g., 100

  @Field({ nullable: true })
  maxUsesPerUser?: number; // e.g., 1 or 2

}

@InputType()
export class CouponUpdateDTO implements Partial<Coupon>{
    
    @Field()
    discountAmount: number;

    @Field({nullable: true})
    isPercantage?: boolean;

    @Field({nullable: true})
    minimumPurchaseAmount?: number;

    @Field({nullable: true})
    expiresAt?: Date;

    @Field({ nullable: true })
    maxUses?: number; // e.g., 100

  @Field({ nullable: true })
  maxUsesPerUser?: number; // e.g., 1 or 2
    
    @Field({nullable: true})
    isActive?: boolean;
}