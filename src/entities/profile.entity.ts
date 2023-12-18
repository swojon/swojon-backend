
import { IsNotEmpty } from "class-validator";
import { BaseEntity, Column, Entity, OneToOne, PrimaryGeneratedColumn, Unique } from "typeorm";

//entity of a user profile
@Entity()
export class ProfileEntity extends BaseEntity{
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ nullable: true })
    name: string;

    @Column({nullable: true, length: 11})
    phoneNumber: string;

    @Column({default: false})
    isPhoneNumberVerified: boolean;

    @Column({nullable: true})
    address: string;

    @Column({nullable: true})
    city: string;

    @Column({nullable: true})
    state: string;

    @Column({nullable: true})
    zipCode: string;

    @Column({nullable: true})
    country: string;

    @Column({nullable: true})
    facebookHandle: string;

    @Column({nullable: true})
    twitterHandle: string;

    @Column({nullable: true})
    instagramHandle: string;

    @Column({nullable: true})
    linkedinHandle: string;

    @Column({nullable: true})
    googleHandle: string;

    @Column({nullable: true})
    avatar: string;

    @Column({nullable: true})
    avatarThumbnail: string;

}
