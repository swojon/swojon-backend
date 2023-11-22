import { IsNotEmpty } from "class-validator";
import { BaseEntity, Column, CreateDateColumn, DeleteDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { UserEntity } from "./users.entity";

@Entity()
export class SearchEntity extends BaseEntity{
    @PrimaryGeneratedColumn()
    id: number;

    
    //Now only save the searches in the database. later implement saved search. 
    @Column()
    searchQuery: string; 

    @Column()
    rawSql: string;

    @Column({default: false})
    isSaved: boolean;

    @Column({nullable: true})
    title: string;
        
    //many to one relationship with user
    @ManyToOne(() => UserEntity, {nullable: true })
    user: UserEntity;

    @Column({nullable: true})
    userId: number;

    @CreateDateColumn()
    dateCreated: Date;x

    @DeleteDateColumn({name: 'deleted_at'})
    deletedAt: Date;

}