import { BaseEntity, Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, Relation } from "typeorm";
import { UserEntity } from "./users.entity";

export enum NotificationType {
    ERROR = 'error',
    SUCCESS = 'success',
    INFO = 'info',
    WARNING = 'warning',
  }
  
@Entity()
export class NotificationEntity extends BaseEntity{
    @PrimaryGeneratedColumn()
    id: number;

    @Column({default: false})
    read: boolean;

    @ManyToOne(() => UserEntity)
    user:Relation<UserEntity>;

    @Column({nullable:true})
    userId: number;

    @Column()
    content: string;

    @Column({nullable:true})
    chatRoomId: number;

    @Column({nullable:true})
    listingId: number;

    @Column({nullable:true})
    relatedUserUsername: string;

    @Column({ type: 'enum', enum: NotificationType , default: "info"})
    type: NotificationType;

    @CreateDateColumn()
    dateCreated: Date;

}
