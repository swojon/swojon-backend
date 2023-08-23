import { BaseEntity, Column, Entity, JoinColumn, ManyToMany, ManyToOne, OneToOne, PrimaryGeneratedColumn, Unique } from "typeorm";
import { UserEntity } from "./users.entity";
import { CommunityEntity } from "./community.entity";
import { ListingEntity } from "./listing.entity";

//entty for review of a seller
@Entity()
export class SellerReviewEntity extends BaseEntity{

      //column for id, primary key, generated
      @PrimaryGeneratedColumn()
      id: number;

      //many to one relationship with user
      @ManyToOne(() => UserEntity)
      user: UserEntity;

      @ManyToOne(() => UserEntity)
      seller: UserEntity;

      //relation with listing
      @ManyToOne(() => ListingEntity)
      listing: ListingEntity;

      //column for review, not empty
      @Column()
      review: string;

      //column for rating, not empty
      @Column()
      rating: number;

      //column for isDeleted, not empty
      @Column({default: false})
      isDeleted: boolean;

      //column for date created, not empty
      @Column({nullable: true})
      dateCreated: Date;

      //column for date updated, not empty
      @Column({nullable: true})
      dateUpdated: Date;

    }
