import { BaseEntity, Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { ListingEntity } from "./listing.entity";


//entity for saving the media of a listing
@Entity()
export class ListingMediaEntity extends BaseEntity{
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => ListingEntity, {nullable:true, cascade:true})
    listing: ListingEntity;

    @Column({nullable:true})
    media: string;

    @Column({nullable:true})
    url: string;

    @Column({nullable:true})
    alt: string;

    @Column({default: false})
    isDeleted: boolean;

    @Column({default: false})
    isPrimary: boolean;

    @Column({nullable: true})
    dateCreated: Date;

  }
