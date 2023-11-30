import { BaseEntity, Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
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
    user: UserEntity;

    @Column({nullable:true})
    userId: number;

    @Column()
    content: string;

    @Column({type: "jsonb"})
    context: Record<string, any>;

    @Column({ type: 'enum', enum: NotificationType , default: "info"})
    type: NotificationType;

    @CreateDateColumn()
    dateCreated: Date;

}
