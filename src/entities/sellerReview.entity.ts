import { BaseEntity, Column, CreateDateColumn, Entity, JoinColumn, ManyToMany, ManyToOne, OneToOne, PrimaryGeneratedColumn, Unique, UpdateDateColumn } from "typeorm";
import { UserEntity } from "./users.entity";
import { ListingEntity } from "./listing.entity";
import { Float } from "type-graphql";

//entty for review of a seller
@Entity()
export class SellerReviewEntity extends BaseEntity{

      //column for id, primary key, generated
      @PrimaryGeneratedColumn()
      id: number;

      //many to one relationship with user
      @ManyToOne(() => UserEntity)
      reviewer: UserEntity;

      @Column({nullable: true})
      reviewerId: number;


      @ManyToOne(() => UserEntity)
      seller: UserEntity;
      
      @Column({nullable: true})
      sellerId: number;
      
      //relation with listing
      @ManyToOne(() => ListingEntity)
      listing: ListingEntity;
      
      @Column({nullable: true})
      listingId: number;
      //column for review, not empty
      @Column({nullable:true})
      review: string;

      //column for rating, not empty
      @Column({type: "decimal", precision: 10, scale: 2, default: 0})
      rating: number;

      //column for isDeleted, not empty
      @Column({default: false})
      isDeleted: boolean;

      //column for date created, not empty
      @CreateDateColumn()
      dateCreated: Date;

      //column for date updated, not empty
      @UpdateDateColumn()
      dateUpdated: Date;

    }
