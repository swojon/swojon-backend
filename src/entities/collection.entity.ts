import { Entity, PrimaryGeneratedColumn, Column, ManyToMany, JoinTable, CreateDateColumn, UpdateDateColumn, DeleteDateColumn, BaseEntity } from "typeorm";
import { ListingEntity } from "./listing.entity";
import { IsNotEmpty } from "class-validator";

@Entity()
export class CollectionEntity extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number;
    //column for slug, unique, not empty
    @Column()
    @IsNotEmpty()
    slug: string;

    @Column({default: false})
    isFeatured: boolean;

    
    @Column ({default: false})
    isDeleted: boolean;

    @DeleteDateColumn({name: 'deleted_at'})
    deletedAt: Date;

    @Column({default: false})
    isActive: boolean;

    @Column()
    name: string;

    @Column({ nullable: true })
    description: string;

    @Column({ nullable: true })
    banner: string; // Store banner image URL

    @ManyToMany(() => ListingEntity, (listing) => listing.collections)
    @JoinTable() // This ensures the many-to-many relationship table is created
    listings: ListingEntity[];

    @CreateDateColumn()
    dateCreated: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}