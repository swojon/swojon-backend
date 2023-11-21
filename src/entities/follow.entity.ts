
import { BaseEntity, Column, Entity, JoinColumn, ManyToMany, ManyToOne, OneToOne, PrimaryGeneratedColumn, Unique } from "typeorm";
import { UserEntity } from "./users.entity";
// import { CommunityEntity } from "./community.entity";

@Entity()
export class FollowEntity extends BaseEntity{

    @PrimaryGeneratedColumn()
    id: number;

    //many to one relationship with user
    @ManyToOne(() => UserEntity)
    user: UserEntity;

    @Column({nullable: true})
    userId: number;

    //many to one relationship with community
    @ManyToOne(() => UserEntity)
    followedUser: UserEntity;

    @Column({nullable: true})
    followedUserId: number;
    
    //column for isDeleted, not empty
    @Column({default: false})
    isDeleted: boolean;

    //column for date joined, not empty
    @Column({default: new Date()})
    dateFollowed: Date;

}


