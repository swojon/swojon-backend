import { Field, ObjectType } from 'type-graphql';
import { Order } from './order.type';
import { User } from './users.type';

@ObjectType()
export class Coupon {
  @Field()
  id?: number;

  @Field(() => String, { nullable: true })
  code?:  string;
  
  @Field(() => Number, { nullable: true })
  discountAmount?: Number ;

  @Field(() => Boolean, { nullable: true })
  isPercantage?: boolean;

  @Field(() => Number, { nullable: true })
  minimumPurchaseAmount?: Number ;

  @Field(() => Date, { nullable: true })
  expiresAt?: Date ;

  @Field(() => Boolean, { nullable: true })
  isActive?: boolean ;

  @Field(() => [Order], { nullable: true })
  orders?: Order[];

  @Field(() => [Usages], { nullable: true })
  usages?: Usages[] ;

}

@ObjectType()
export class Usages {
    @Field()
  id?: number;

  @Field({ nullable: true})
  user?: User;

  @Field(() => Date, { nullable: true })
  usedAt?: Date ;
}


@ObjectType()
export class Coupons {
  @Field(type => [Coupon])
  items?: Coupon[];

  @Field({nullable:true})
  count?: number

  @Field()
  hasMore?: boolean

  @Field({nullable:true})
  beforeCursor?:string;

  @Field({nullable:true})
  afterCursor?:string;
}
