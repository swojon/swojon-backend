import { Entity, BaseEntity, PrimaryGeneratedColumn, Column, OneToMany, ManyToOne, CreateDateColumn } from "typeorm";
import { OrderEntity } from "./order.entity";
import { UserEntity } from "./users.entity";

@Entity()
export class CouponEntity extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  code: string;

  @Column('decimal')
  discountAmount: number;

  @Column({default: false}) //set to true if percantage is true
  isPercantage: boolean; 

  @Column('decimal', { nullable: true })
  minimumPurchaseAmount: number;

  @Column({ type: 'timestamp' })
  expiresAt: Date;

  @Column({ nullable: true })
  maxUses: number; // e.g., 100

  @Column({ nullable: true })
  maxUsesPerUser: number; // e.g., 1 or 2

  @CreateDateColumn()
  createdAt: Date;

  @OneToMany(() => CouponUsageEntity, usage => usage.coupon)
  usages: CouponUsageEntity[];

  @Column({ default: true })
  isActive: boolean;

  @OneToMany(() => OrderEntity, order => order.coupon)
  orders: OrderEntity[];

}

@Entity()
export class CouponUsageEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => UserEntity, { onDelete: 'CASCADE' })
  user: UserEntity;

  @ManyToOne(() => CouponEntity, coupon => coupon.usages, { onDelete: 'CASCADE' })
  coupon: CouponEntity;

  @CreateDateColumn()
  usedAt: Date;
}

