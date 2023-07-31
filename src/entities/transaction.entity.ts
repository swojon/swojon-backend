import { BaseEntity, Column, Entity, JoinColumn, ManyToMany, ManyToOne, OneToOne, PrimaryGeneratedColumn, Unique } from "typeorm";
import { UserEntity } from "./users.entity";
import { CommunityEntity } from "./community.entity";
import { ListingEntity } from "./listing.entity";


//entity for saving the medias of a listing
@Entity()
export class TransactionEntity extends BaseEntity{
    //fields for transaction

    //column for id, primary key, generated
    @PrimaryGeneratedColumn()
    id: number;

    //field for transactionId, 
    @Column()
    transactionId: string;

    //field for transactionType,
    @Column()
    transactionType: string;

    //field for transactionStatus,
    @Column()
    transactionStatus: string;

    //field for transactionAmount,
    @Column()
    transactionAmount: number;

    //field for transactionCurrency,
    @Column()
    transactionCurrency: string;

    //field for transactionDate,
    @Column()
    transactionDate: Date;

    //field for transactionDescription,
    @Column()
    transactionDescription: string;

    //field for transactionMethod,
    @Column()
    transactionMethod: string;

    //field for transactionFee,
    @Column()
    transactionFee: number;

    //field for transactionFeeCurrency,
    @Column()
    transactionFeeCurrency: string;

    //field for transactionFeeDescription,
    @Column()
    transactionFeeDescription: string;

    //field for transactionFeeType,
    @Column()
    transactionFeeType: string;

    //field for transactionFeePercentage,
    @Column()
    transactionFeePercentage: number;

}