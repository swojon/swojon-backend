import { BaseEntity, Column, Entity, JoinTable, ManyToMany, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { UserEntity } from "./users.entity";
import { ProductEntity } from "./product.entity";


//entity for saving user chats
@Entity()
export class ChatRoomEntity extends BaseEntity{
    //column for id, primary key, generated
    @PrimaryGeneratedColumn()
    id: number;

    //column for chat name
    @Column()
    chatName: string;

    //column for product context
    @ManyToOne(() => ProductEntity, {nullable: true})
    context: ProductEntity;

}

//entity for saving user chats
@Entity()
export class ChatRoomMemberEntity extends BaseEntity{
  @PrimaryGeneratedColumn()
  id: number;

  //many to one relationship with user
  @ManyToOne(() => UserEntity)
  user: UserEntity;

  //many to one relationship with chat room
  @ManyToOne(() => ChatRoomEntity, {onDelete: "CASCADE"})
  chatRoom: ChatRoomEntity;

}
