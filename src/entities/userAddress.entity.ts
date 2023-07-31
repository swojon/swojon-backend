import { BaseEntity, Column, Entity, JoinColumn, ManyToMany, ManyToOne, OneToOne, PrimaryGeneratedColumn, Unique } from "typeorm";
import { UserEntity } from "./users.entity";
import { CommunityEntity } from "./community.entity";
import { ListingEntity } from "./listing.entity";
import { AddressEntity } from "./address.entity";


//entity for saving the medias of a listing
@Entity()
export class UserAddressEntity extends BaseEntity{
    //fields for UserAddress

    //column for id, primary key, generated
    @PrimaryGeneratedColumn()
    id: number;

    //many to one relationship with user
    @ManyToOne(() => UserEntity)
    user: UserEntity;

    //many to one relationship with address
    @ManyToOne(() => AddressEntity)
    address: AddressEntity;

    //isDefault
    @Column({default: false})
    isDefault: boolean;

  }
