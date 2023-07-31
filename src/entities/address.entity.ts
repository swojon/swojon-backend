import { BaseEntity, Column, Entity, JoinColumn, ManyToMany, ManyToOne, OneToOne, PrimaryGeneratedColumn, Unique } from "typeorm";
import { UserEntity } from "./users.entity";
import { CommunityEntity } from "./community.entity";
import { ListingEntity } from "./listing.entity";


//entity for saving the medias of a listing
@Entity()
export class AddressEntity extends BaseEntity{
    //fields for Address

    //column for id, primary key, generated
    @PrimaryGeneratedColumn()
    id: number;

    //address line 1
    @Column()
    addressLine1: string;

    //address line 2
    @Column()
    addressLine2: string;

    //city
    @Column()
    city: string;

    //state
    @Column()
    state: string;

    //country
    @Column()
    country: string;

    //postal code
    @Column()
    postalCode: string;

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
