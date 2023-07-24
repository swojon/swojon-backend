import { IsNotEmpty } from "class-validator";
import { BaseEntity, Column, Entity, JoinColumn, ManyToMany, ManyToOne, OneToOne, PrimaryGeneratedColumn, Unique } from "typeorm";
import { UserEntity } from "./users.entity";

@Entity()
export class CommunityEntity extends BaseEntity{

    @PrimaryGeneratedColumn()
    id: number;

    //column for name, unique, not empty
    @Column()
    @IsNotEmpty()
    name: string;

    //column for slug, unique, not empty
    @Column()
    @IsNotEmpty()
    slug: string;

    //community location
    @Column({nullable: true})
    location: string;

    //location latitude
    @Column({nullable: true})
    latitude: number;

    //location longitude
    @Column({nullable: true})
    longitude: number;



    //column for description, not empty
    @Column({nullable: true})
    description: string;

    //column for avatar, not empty
    @Column({nullable: true})
    banner: string;

    @Column({default: false})
    isLive: boolean;

    @Column({default: false})
    isApproved: boolean;

    @Column({default: false})
    isFeatured: boolean;

    @Column({default: false})
    isSponsored: boolean;

    @Column({default: false})
    isVerified: boolean;
}
