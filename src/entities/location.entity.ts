import { IsNotEmpty } from "class-validator";
import { BaseEntity, Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";



@Entity()
export class LocationEntity extends BaseEntity{
    @PrimaryGeneratedColumn()
    id: number;

    //column for name, unique, not empty
    @Column()
    @IsNotEmpty()
    name: string;

    //parent location foreign key
    @ManyToOne(type => LocationEntity, location => location.parentLocation, {onDelete: 'CASCADE'})
    parentLocation: LocationEntity;

    //column for slug, unique, not empty
    @Column()
    @IsNotEmpty()
    slug: string;

    //column for description, not empty
    @Column({nullable: true})
    description: string;

    //column for avatar, not empty
    @Column({nullable: true})
    banner: string;

    @Column({default: false})
    isLive: boolean;

    @Column({default: false})
    isApproved: boolean;

    @Column({default: false})
    isFeatured: boolean;

    @Column({default: false})
    isSponsored: boolean;

    @Column({default: false})
    isGlobal: boolean;

}
