import { BaseEntity, Column, Entity, JoinColumn, ManyToMany, ManyToOne, OneToOne, PrimaryGeneratedColumn, Unique } from "typeorm";
import { UserEntity } from "./users.entity";
import { CommunityEntity } from "./community.entity";
import { ListingEntity } from "./listing.entity";


//entity for saving the medias of a listing
@Entity()
export class ListingMediaEntity extends BaseEntity{

    //column for id, primary key, generated
    @PrimaryGeneratedColumn()
    id: number;

    //many to one relationship with listing
    @ManyToOne(() => ListingEntity)
    listing: ListingEntity;

    //column for media, not empty
    @Column()
    media: string;

    //column for isDeleted, not empty
    @Column({default: false})
    isDeleted: boolean;

    //isPrimary
    @Column({default: false})
    isPrimary: boolean;

    //column for date created, not empty
    @Column({nullable: true})
    dateCreated: Date;

    //column for date updated, not empty
    @Column({nullable: true})
    dateUpdated: Date;

  }
