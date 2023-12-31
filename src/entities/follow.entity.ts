
import { BaseEntity, Column, DeleteDateColumn, Entity, JoinColumn, ManyToMany, ManyToOne, OneToOne, PrimaryGeneratedColumn, Relation, Unique } from "typeorm";
import { UserEntity } from "./users.entity";
// import { CommunityEntity } from "./community.entity";

@Entity()
export class FollowEntity extends BaseEntity{

    @PrimaryGeneratedColumn()
    id: number;

    //many to one relationship with user
    @ManyToOne(() => UserEntity)
    user: Relation<UserEntity>;

    @Column({nullable: true})
    userId: number;

    //many to one relationship with community
    @ManyToOne(() => UserEntity)
    followedUser: Relation<UserEntity>;

    @Column({nullable: true})
    followedUserId: number;
    
    //column for isDeleted, not empty
    @Column({default: false})
    isDeleted: boolean;

    @DeleteDateColumn({name: "deleted_at"})
    deletedAt: Date; 
    
    //column for date joined, not empty
    @Column({default: new Date()})
    dateFollowed: Date;

}


