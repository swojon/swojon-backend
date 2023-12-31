import { IsNotEmpty } from "class-validator";
import { BaseEntity, Column, DeleteDateColumn, Entity, JoinTable, ManyToMany, ManyToOne, PrimaryGeneratedColumn, Relation, Unique } from "typeorm";
import { CategoryEntity } from "./category.entity";

@Entity()
export class BrandEntity extends BaseEntity{
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  @IsNotEmpty()
  name: string;

  @Column()
  @IsNotEmpty()
  slug: string;

  @Column({nullable: true})
  description: string;

  @Column({nullable: true})
  logo: string;

  @Column({default: false})
  isFeatured: boolean;

  @Column({default: false})
  isDeleted: boolean;

  @DeleteDateColumn({name: 'deleted_at'})
  deletedAt: Date;

  @ManyToMany(()=>CategoryEntity)
  @JoinTable()
  categories: Relation<CategoryEntity>[]

}

