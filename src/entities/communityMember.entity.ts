
import { BaseEntity, Column, Entity, JoinColumn, ManyToMany, ManyToOne, OneToOne, PrimaryGeneratedColumn, Relation, Unique } from "typeorm";
import { UserEntity } from "./users.entity";
import { CommunityEntity } from "./community.entity";

@Entity()
export class CommunityMemberEntity extends BaseEntity{
    //column for id, primary key, generated
    @PrimaryGeneratedColumn()
    id: number;

    //many to one relationship with user
    @ManyToOne(() => UserEntity)
    user: UserEntity;

    @Column({nullable: true})
    userId: number;


    //many to one relationship with community
    @ManyToOne(() => CommunityEntity, (community) => community.members )
    community:Relation<CommunityEntity>;

    @Column({nullable: true})
    communityId: number;
    
    //column for role, not empty
    @Column({nullable: true})
    role: string;

    //column for status, not empty
    @Column({nullable: true})
    status: string;

    //column for isApproved, not empty
    @Column({default: false})
    isApproved: boolean;

    //column for isBanned, not empty
    @Column({default: false})
    isBanned: boolean;

    //column for isMuted, not empty
    @Column({default: false})
    isMuted: boolean;

    //column for isBlocked, not empty
    @Column({default: false})
    isBlocked: boolean;

    //column for isDeleted, not empty
    @Column({default: false})
    isDeleted: boolean;

    //column for date joined, not empty
    @Column({nullable: true})
    dateJoined: Date;

}
