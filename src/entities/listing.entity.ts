
import { BaseEntity, Column, CreateDateColumn, Entity, JoinColumn, JoinTable, ManyToMany, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn, Relation, Unique, UpdateDateColumn } from "typeorm";
import { UserEntity } from "./users.entity";
import { CommunityEntity } from "./community.entity";
import { CategoryEntity } from "./category.entity";
import { BrandEntity } from "./brand.entity";
import { LocationEntity } from "./location.entity";
import { ListingMediaEntity } from "./listingMedia.entity";

export enum Status {
  PENDING = "pending",
  APPROVED = "approved",
  REJECTED = "rejected"
}

//entity for listing
@Entity()
export class ListingEntity extends BaseEntity{

    //column for id, primary key, generated
    @PrimaryGeneratedColumn()
    id: number;

    @Column({nullable: true})
    slug: string;

    //many to one relationship with user
    @ManyToOne(() => UserEntity)
    user: Relation<UserEntity>;

    //column for title, not empty
    @Column()
    title: string;

    //column for description, not empty
    @Column({nullable:true})
    description: string;

    // @Column({type: "jsonb"})
    // metadata: {};
    @Column({nullable:true, default: 'used'})
    condition: string;

    @Column({default: 1})
    quantity: number;

    @Column({default: "meetup", nullable:true})
    dealingMethod: string;

    @Column({nullable: true})
    courierDetails: string;

    //column for price, not empty
    @Column()
    price: number;

    //column for location, not empty
    @Column('jsonb', {nullable:true})
    meetupLocations: object[];

    @Column({default: false})
    isLive: boolean;

    //column for isFeatured, not empty
    @Column({default: false})
    isFeatured: boolean;

    @ManyToOne(() => CategoryEntity)
    category: Relation<CategoryEntity>;

    @ManyToOne(()=> BrandEntity, {nullable:true})
    brand:Relation<BrandEntity>;

    @Column({
      type:"enum",
      enum: Status,
      default:Status.PENDING
    })
    status: Status;

    @Column({nullable:true})
    rejectReason: string;
    
    @Column({default: false})
    isDeleted: boolean;

    @Column({default:true})
    isAvailable: boolean;

    @Column({nullable:true})
    deleteReason: string;

    @Column({ name: 'datePublished', type: 'timestamp', nullable: true, default: null })
    datePublished: Date;
    
    @CreateDateColumn()
    dateCreated: Date;

    @Column({nullable: true})
    dateDeleted: Date;

    @Column({default: false})
    isSold: boolean;

    @Column({default: false})
    isSoldHere: boolean;

    @ManyToMany(()=>ListingMediaEntity, {cascade: true})
    @JoinTable()
    media: Relation<ListingMediaEntity>[]

    @Column("tsvector", { select: false, nullable: true })
    document_with_weights: any;


}
