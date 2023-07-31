//create table role
import { IsNotEmpty } from 'class-validator';
import { BaseEntity, Entity, PrimaryGeneratedColumn, Column, Unique, CreateDateColumn, UpdateDateColumn, JoinColumn, OneToOne, ManyToMany } from 'typeorm';
import { User } from '@interfaces/users.interface';
import { ProfileEntity } from './profile.entity';


@Entity()
export class RoleEntity extends BaseEntity  {
    //write fields for role
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    @IsNotEmpty()
    name: string;

    @Column({nullable: true})
    description: string;

    @Column({default: false})
    isDeleted: boolean;

    @Column({default: false})
    isApproved: boolean;


}
