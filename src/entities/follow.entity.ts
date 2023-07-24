
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

    //many to one relationship with community
    @ManyToOne(() => UserEntity)
    followedUser: UserEntity;

    //column for isDeleted, not empty
    @Column({default: false})
    isDeleted: boolean;

    //column for date joined, not empty
    @Column({nullable: true})
    dateFollowed: Date;

}
