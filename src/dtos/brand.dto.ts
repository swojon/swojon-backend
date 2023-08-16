import { Field, InputType } from "type-graphql";

@InputType()
export class BrandCreateDTO {
  @Field()
  name: string;

  @Field()
  slug: string

  @Field({nullable: true})
  description?: string

  @Field({nullable: true})
  logo?: string

  @Field({nullable: true})
  isFeatured?: boolean

}

@InputType()
export class BrandUpdateDTO{
  @Field({nullable: true})
  name?: string

  @Field({nullable: true})
  slug?:string

  @Field({nullable: true})
  description?: string

  @Field({nullable: true})
  isFeatured?:boolean

  @Field({nullable: true})
  logo?: string

  @Field({nullable:true})
  isDeleted?: boolean

}

@InputType()
export class BrandCategoryInput{
  @Field()
  brandId : number

  @Field(()=>[Number], {nullable:true})
  categoryIds: number[]

}

