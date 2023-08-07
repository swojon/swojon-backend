import { Entity, BaseEntity, PrimaryGeneratedColumn, ManyToOne, Column } from "typeorm";
import { ChatRoomEntity } from "./userChats.entity";
import { UserEntity } from "./users.entity";


//entity for chat messages
@Entity()
export class ChatMessageEntity extends BaseEntity{
  @PrimaryGeneratedColumn()
  id: number;

  //column for chat room id
  //one to many relationship with chat room
  @ManyToOne(() => ChatRoomEntity, {onDelete: "CASCADE"})
  chatRoom: ChatRoomEntity;

  //column for message
  @Column()
  content: string;

  //column for date sent
  @Column({default: new Date()})
  dateSent: Date;

  //column for isRead
  @Column({default: false})
  isRead: boolean;

  //column for isDeleted
  @Column({default: false})
  isDeleted: boolean;

  @ManyToOne(() => UserEntity, {onDelete: "CASCADE"})
  sender: UserEntity;

}
