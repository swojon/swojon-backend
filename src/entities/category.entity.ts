import { IsNotEmpty } from "class-validator";
import { BaseEntity, Column, DeleteDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, Relation } from "typeorm";

export enum Status {
  PENDING = "pending",
  APPROVED = "approved",
  REJECTED = "rejected"
}

@Entity()
export class CategoryEntity extends BaseEntity{
    @PrimaryGeneratedColumn()
    id: number;

    //column for name, unique, not empty
    @Column()
    @IsNotEmpty()
    name: string;

    //parent category foreign key
    @ManyToOne(type => CategoryEntity, category => category.parentCategory, {onDelete: 'CASCADE'})
    parentCategory: Relation<CategoryEntity>;

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

    @Column({nullable: true})
    icon: string;

    @Column({
      type:"enum",
      enum: Status,
      default:Status.PENDING
    })
    status: Status;

    @Column({nullable:true})
    rejectReason: string;

    @Column({default: false})
    isFeatured: boolean;

    @Column({default: false})
    isSponsored: boolean;

    @Column({default: false})
    isGlobal: boolean;

    @Column ({default: false})
    isDeleted: boolean;

    @DeleteDateColumn({name: 'deleted_at'})
    deletedAt: Date;
}
