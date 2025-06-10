import { Entity, BaseEntity, PrimaryGeneratedColumn, ManyToOne, OneToMany, Column, CreateDateColumn } from "typeorm";
import { AddressEntity } from "./address.entity";
import { CouponEntity } from "./coupon.entity";
import { ListingEntity, ProductVariantEntity } from "./listing.entity";
import { UserEntity } from "./users.entity";

// order.entity.ts
@Entity()
export class OrderEntity extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => UserEntity)
  user: UserEntity;

  @Column({ type: 'jsonb' }) // Use 'jsonb' in Postgres
  shippingAddress: {
    name: string;
    phoneNumber: string;
    address: string;
    policeStation: string;
    district: string;
  };

  @OneToMany(() => OrderItemEntity, item => item.order, { cascade: true })
  items: OrderItemEntity[];

  @ManyToOne(() => CouponEntity, { nullable: true })
  coupon: CouponEntity;

  @Column('decimal')
  totalAmount: number;

  @Column('decimal')
  finalAmount: number;

  @Column({ default: 'PENDING' })
  status: string;

  @CreateDateColumn()
  createdAt: Date;

    @Column({ 
        type: 'enum', 
        enum: ['PENDING', 'PROCESSING', 'CANCELLED', 'SHIPPED', 'PACKED', 'DELIVERED'], 
        default: 'PENDING' 
    })
    orderStatus: 'PENDING' | 'PROCESSING' | 'CANCELLED' | 'SHIPPED' | 'PACKED' | 'DELIVERED';

    @Column({ 
        type: 'enum', 
        enum: ['PENDING', 'PAID', 'FAILED', 'REFUNDED'], 
        default: 'PENDING' 
    })
    paymentStatus: 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED';

    @Column({ type: 'text', nullable: true })
    notes?: string;

    @Column({ type: 'varchar', length: 255, nullable: true })
    trackingNumber?: string;
}


// order-item.entity.ts
@Entity()
export class OrderItemEntity extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => OrderEntity, order => order.items)
  order: OrderEntity;

  @ManyToOne(() => ProductVariantEntity)
  variant: ProductVariantEntity;

  @ManyToOne(() => ListingEntity)
  listing: ListingEntity;

  @Column('int')
  quantity: number;

  @Column('decimal')
  price: number;

  @Column('decimal')
  total: number;
}
