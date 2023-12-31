import { IsNotEmpty } from "class-validator";
import { BaseEntity, Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, Relation, UpdateDateColumn } from "typeorm";
import { UserEntity } from "./users.entity";

export enum TRANSACTION_TYPE {
  REFERRAL = "referral",
  EXPIRED = "expired",
  REFILL = "refill",
  REWARD = "reward",
  EXPENSE = "expense"
}


@Entity()
export class PointEntity extends BaseEntity{
    @PrimaryGeneratedColumn()
    id: number;

    //many to one relationship with user
    @ManyToOne(() => UserEntity)
    user: Relation<UserEntity>;

    @Column()
    @IsNotEmpty()
    amount: number

    @Column({
      type:"enum",
      enum: TRANSACTION_TYPE,
      default:TRANSACTION_TYPE.REFILL
    })
    type: TRANSACTION_TYPE;

    @Column({ type: "timestamptz", precision: 3 ,nullable:false})
    expireAt: Date;

    @Column({default: false})
    isBlocked: boolean;

    @Column({default: 0})
    consumed: number;

    //column for description, not empty
    @Column({nullable: true})
    description: string;

    @Column({default:true})
    isPlus: boolean;  // for direction

    @CreateDateColumn()
    dateCreated: Date;

    @UpdateDateColumn()
    dateUpdated: Date;


}
