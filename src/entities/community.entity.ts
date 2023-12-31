import { IsNotEmpty } from "class-validator";
import { BaseEntity, Column, Entity, JoinColumn, ManyToMany, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn, Relation, Unique } from "typeorm";
import { UserEntity } from "./users.entity";
import { CommunityMemberEntity } from "./communityMember.entity";
import { LocationEntity } from "./location.entity";


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

    //column for location, not empty
    @ManyToOne(()=>LocationEntity, {nullable:true})
    location: Relation<LocationEntity>;


    //location latitude
    @Column({nullable: true})
    latitude: string;

    //location longitude
    @Column({nullable: true})
    longitude: string;

    //column for description, not empty
    @Column({nullable: true})
    description: string;

    //column for avatar, not empty
    @Column({nullable: true})
    banner: string;

    @Column({default: false})
    isLive: boolean;

    @Column({default: false})
    isFeatured: boolean;

    @Column({default: false})
    isDeleted: boolean;

    @OneToMany(() => CommunityMemberEntity, (member) => member.community, {cascade: true})
    members: Relation<CommunityMemberEntity>[]

}
