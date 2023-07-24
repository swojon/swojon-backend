
import { BaseEntity, Column, Entity, JoinColumn, ManyToMany, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn, Unique } from "typeorm";
import { UserEntity } from "./users.entity";
import { CommunityEntity } from "./community.entity";
import { ListingMediaEntity } from "./listingMedia.entity";
import { on } from "events";
import { CategoryEntity } from "./category.entity";

//entity for listing
@Entity()
export class ListingEntity extends BaseEntity{

    //column for id, primary key, generated
    @PrimaryGeneratedColumn()
    id: number;

    //many to one relationship with user
    @ManyToOne(() => UserEntity)
    user: UserEntity;

    //one listing can belong to many communities
    @ManyToMany(() => CommunityEntity)
    @JoinColumn()
    communities: CommunityEntity[];


    //column for title, not empty
    @Column()
    title: string;

    //column for description, not empty
    @Column()
    description: string;

    //column for price, not empty
    @Column()
    price: number;

    //column for location, not empty
    @Column()
    location: string;

    //column for latitude, not empty
    @Column()
    latitude: number;

    //column for longitude, not empty
    @Column()
    longitude: number;

    //column for isLive, not empty
    @Column({default: false})
    isLive: boolean;

    //column for isFeatured, not empty
    @Column({default: false})
    isFeatured: boolean;

    //column for isSponsored, not empty
    @Column({default: false})
    isSponsored: boolean;

    //image for listing, a posting can contain multiple images from listingMedia
    //one to many relationship with listingMedia
    @OneToMany(
        () => ListingMediaEntity,
        (listingMedia: ListingMediaEntity) => listingMedia.listing,
        {cascade: true}
    )
    listingMedia: ListingMediaEntity[];

    //column for isApproved, not empty
    @Column({default: false})
    isApproved: boolean;

    //column for isDeleted, not empty
    @Column({default: false})
    isDeleted: boolean;

    //column for date created, not empty
    @Column({nullable: true})
    dateCreated: Date;

    //column for date updated, not empty
    @Column({nullable: true})
    dateUpdated: Date;

    //column for date deleted, not empty
    @Column({nullable: true})
    dateDeleted: Date;

   @ManyToOne(() => CategoryEntity)
    category: CategoryEntity;

    //column for isSold, not empty
    @Column({default: false})
    isSold: boolean;



}
