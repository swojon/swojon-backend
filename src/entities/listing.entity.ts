
import { BaseEntity, Column, CreateDateColumn, Entity, JoinTable, ManyToMany, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn, Relation, Unique, UpdateDateColumn } from "typeorm";
import { UserEntity } from "./users.entity";
import { CategoryEntity } from "./category.entity";
import { BrandEntity } from "./brand.entity";
import { ListingMediaEntity } from "./listingMedia.entity";
import { CollectionEntity } from "./collection.entity";

export enum Status {
  PENDING = "pending",
  APPROVED = "approved",
  REJECTED = "rejected"
}

//entity for listing
@Entity()
export class ListingEntity extends BaseEntity{

    //column for id, primary key, generated
    @PrimaryGeneratedColumn()
    id: number;

    @Column({nullable: true})
    slug: string;

    //many to one relationship with user
    @ManyToOne(() => UserEntity)
    user: Relation<UserEntity>;

    //column for title, not empty
    @Column()
    title: string;

    //column for description, not empty
    @Column({nullable:true})
    description: string;
  
    
    @Column({ nullable: true })
    sku: string; // e.g., "Red - Large", "Blue - Medium"

    // @Column({type: "jsonb"})
    // metadata: {};
    @Column({nullable:true, default: 'used'})
    condition: string;

    @Column({default: 0})
    stock: number;

    //column for price, not empty
    @Column()
    price: number;

    @Column({nullable: true})
    salePrice : number;
    
    @Column({default: false})
    isLive: boolean;

    //column for isFeatured, not empty
    @Column({default: false})
    isFeatured: boolean;

    @ManyToOne(() => CategoryEntity)
    category: Relation<CategoryEntity>;

    @ManyToOne(()=> BrandEntity, {nullable:true})
    brand:Relation<BrandEntity>;

    @Column({
      type:"enum",
      enum: Status,
      default:Status.PENDING
    })
    status: Status;

    @Column({nullable:true})
    rejectReason: string;
    
    @Column({default: false})
    isDeleted: boolean;

    @Column({default:true})
    isAvailable: boolean;

    @Column({nullable:true})
    deleteReason: string;

    @Column({ name: 'datePublished', type: 'timestamp', nullable: true, default: null })
    datePublished: Date;
    
    @CreateDateColumn()
    dateCreated: Date;

    @Column({nullable: true})
    dateDeleted: Date;

    @Column({default: false})
    isSold: boolean;

    @Column({default: false})
    isSoldHere: boolean;

    @ManyToMany(()=>ListingMediaEntity, {cascade: true})
    @JoinTable()
    media: Relation<ListingMediaEntity>[]

    @Column({nullable: true})
    videoUrl: string;
    
    @ManyToMany(() => CollectionEntity, (collection) => collection.listings)
    collections: CollectionEntity[];

    @Column("tsvector", { select: false, nullable: true })
    document_with_weights: any;

    @OneToMany(() => ProductVariantEntity, variant => variant.listing, { cascade: true })
    variants: ProductVariantEntity[];
  
    @OneToMany(() => ProductOptionEntity, option => option.listing, { cascade: true })
    options: ProductOptionEntity[];

}


@Entity()
export class ProductVariantEntity extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  sku: string; // e.g., "Red - Large", "Blue - Medium"

  @ManyToOne(() => ListingEntity, listing => listing.variants)
  listing: ListingEntity;

  @Column('decimal')
  price: number;

  @Column({ nullable: true, type: 'decimal' })
  salePrice: number; // e.g., 19.99, null if not on sale

  @Column('int')
  stock: number;

   @ManyToMany(()=>ListingMediaEntity, {cascade: true})
  @JoinTable()
  media: Relation<ListingMediaEntity>[]

  @OneToMany(() => ProductOptionValueEntity, value => value.variant, { cascade: true })
  optionValues: ProductOptionValueEntity[];
}

@Entity()
export class ProductOptionEntity extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string; // e.g., "Color", "Size"

  @ManyToOne(() => ListingEntity, listing => listing.options)
  listing: ListingEntity;
   
  @Column("simple-array")
  values: string[];
  
  @OneToMany(() => ProductOptionValueEntity, value => value.option, { cascade: true })
  optionValues: ProductOptionValueEntity[];
}

@Entity()
export class ProductOptionValueEntity extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  optionName: string; // e.g., "Size", "Color"
  
  @Column()
  value: string; // e.g., "Red", "XL"

  @ManyToOne(() => ProductOptionEntity, option => option.optionValues, { onDelete: 'CASCADE' })
  option: ProductOptionEntity;

  @ManyToOne(() => ProductVariantEntity, variant => variant.optionValues, { onDelete: 'CASCADE' })
  variant: ProductVariantEntity;
}
