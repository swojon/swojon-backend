import { BaseEntity, Column, Entity, JoinColumn, ManyToMany, ManyToOne, OneToOne, PrimaryGeneratedColumn, Unique } from "typeorm";
import { UserEntity } from "./users.entity";


//entity for saving the medias of a listing
@Entity()
export class AddressEntity extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @Column()
    phoneNumber: string;

    @Column()
    address: string;

    @Column()
    policeStation: string;

    @Column()
    district: string;

    @ManyToOne(() => UserEntity, { onDelete: 'CASCADE' })
    user: UserEntity;
}