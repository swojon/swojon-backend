import { IsNotEmpty } from "class-validator";
import { BaseEntity, Column, Entity, JoinTable, ManyToMany, ManyToOne, PrimaryGeneratedColumn, Unique } from "typeorm";
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

  @ManyToMany(()=>CategoryEntity)
  @JoinTable()
  categories: CategoryEntity[]

}

