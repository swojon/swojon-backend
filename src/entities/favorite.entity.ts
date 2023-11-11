import { BaseEntity, Column, CreateDateColumn, Entity, JoinColumn, ManyToMany, ManyToOne, OneToOne, PrimaryGeneratedColumn, Unique } from "typeorm";
import { UserEntity } from "./users.entity";
import { ListingEntity } from "./listing.entity";



//entity for saving the medias of a listing
@Entity()
export class FavoriteEntity extends BaseEntity{

    @PrimaryGeneratedColumn()
    id: number;

    //many to one relationship with user
    @ManyToOne(() => UserEntity)
    user: UserEntity;

    @Column({nullable: true})
    userId: number;

    @Column({nullable: true})
    listingId: number;

    //many to one relationship with listing
    @ManyToOne(() => ListingEntity)
    listing: ListingEntity;

    //column for isDeleted, not empty
    @Column({default: false})
    isDeleted: boolean;

    //column for date created, not empty
    @CreateDateColumn()
    dateCreated: Date;

    //column for date updated, not empty
    @Column({nullable: true})
    dateUpdated: Date;

  }
