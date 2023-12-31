import { BaseEntity, Column, CreateDateColumn, DeleteDateColumn, Entity, JoinColumn, ManyToMany, ManyToOne, OneToOne, PrimaryGeneratedColumn, Relation, Unique } from "typeorm";
import { UserEntity } from "./users.entity";
import { ListingEntity } from "./listing.entity";



//entity for saving the medias of a listing
@Entity()
export class FavoriteEntity extends BaseEntity{

    @PrimaryGeneratedColumn()
    id: number;

    //many to one relationship with user
    @ManyToOne(() => UserEntity)
    user:Relation<UserEntity>;

    @Column({nullable: true})
    userId: number;

    @Column({nullable: true})
    listingId: number;

    //many to one relationship with listing
    @ManyToOne(() => ListingEntity)
    listing: Relation<ListingEntity>;

    //column for isDeleted, not empty
    @Column({default: false})
    isDeleted: boolean;

    //column for date created, not empty
    @CreateDateColumn()
    dateCreated: Date;

    //column for date updated, not empty
    @Column({nullable: true})
    dateUpdated: Date;

    @DeleteDateColumn({name: 'deleted_at'})
    deletedAt: Date;

  }
