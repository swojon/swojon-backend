import { BaseEntity, Column, Entity, JoinTable, ManyToMany, ManyToOne, OneToMany, PrimaryGeneratedColumn, Relation } from "typeorm";
import { UserEntity } from "./users.entity";
import { ListingEntity } from "./listing.entity";


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
    @ManyToOne(() => ListingEntity, {nullable: true})
    relatedListing: Relation<ListingEntity>;

    @Column({nullable:true})
    relatedListingId: number;
    //many to one relationship with chat room
    @OneToMany(() => ChatRoomMemberEntity, member=> member.chatRoom, {nullable: true, cascade: true})
    members: Relation<ChatRoomMemberEntity>[];
  }

//entity for saving user chats
@Entity()
export class ChatRoomMemberEntity extends BaseEntity{
  @PrimaryGeneratedColumn()
  id: number;

  //many to one relationship with user
  @ManyToOne(() => UserEntity)
  user: Relation<UserEntity>;

  @Column({nullable: true})
  userId: number;

  //many to one relationship with chat room
  @ManyToOne(() => ChatRoomEntity, chatRoom => chatRoom.members, {onDelete: "CASCADE"})
  chatRoom: Relation<ChatRoomEntity>;
 
  @Column({nullable: true})
  chatRoomId: number;


}
