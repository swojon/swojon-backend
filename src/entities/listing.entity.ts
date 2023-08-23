
import { BaseEntity, Column, CreateDateColumn, Entity, JoinColumn, JoinTable, ManyToMany, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn, Unique } from "typeorm";
import { UserEntity } from "./users.entity";
import { CommunityEntity } from "./community.entity";
import { CategoryEntity } from "./category.entity";
import { BrandEntity } from "./brand.entity";

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
    @JoinTable()
    communities: CommunityEntity[];

    //column for title, not empty
    @Column()
    title: string;

    //column for description, not empty
    @Column({nullable:true})
    description: string;

    // @Column({type: "jsonb"})
    // metadata: {};

    //column for price, not empty
    @Column()
    price: number;

    //column for location, not empty
    @Column({nullable:true})
    location: string;

    //column for latitude, not empty
    @Column({nullable:true})
    latitude: string;

    //column for longitude, not empty
    @Column({nullable:true})
    longitude: string;

    //column for isLive, not empty
    @Column({default: false})
    isLive: boolean;

    //column for isFeatured, not empty
    @Column({default: false})
    isFeatured: boolean;

    @ManyToOne(() => CategoryEntity)
    category: CategoryEntity;

    @ManyToOne(()=> BrandEntity, {nullable:true})
    brand:BrandEntity;

    @Column({default: false})
    isApproved: boolean;

    @Column({default: false})
    isDeleted: boolean;

    @CreateDateColumn()
    dateCreated: Date;

    @Column({nullable: true})
    dateDeleted: Date;

    @Column({default: false})
    isSold: boolean;

}
