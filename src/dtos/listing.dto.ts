import { Field, InputType } from "type-graphql";

@InputType()
export class ListingCreateDTO {
  @Field()
  title: string;

  @Field({nullable: true})
  description?: string;

  @Field(()=>[Number], {nullable:true})
  communityIds?:number[]

  @Field()
  price:number

  @Field({nullable:true})
  location?: string;

  @Field({nullable:true})
  latitude?: string;

  @Field({nullable:true})
  longitude?: string;

  @Field()
  categoryId : number

  @Field({nullable:true})
  brandId?: number

  @Field(()=>[String], {nullable:true})
  mediaUrls?: string[]

}

@InputType()
export class ListingUpdateDTO{
  @Field({nullable: true})
  title?: string;

  @Field({nullable: true})
  description?: string;

  @Field(()=>[Number], {nullable: true})
  communityIds?:number[]

  @Field({nullable:true})
  price?:number

  @Field({nullable:true})
  location?: string;

  @Field({nullable:true})
  latitude?: number;

  @Field({nullable:true})
  longitude?: number;

  @Field({nullable:true})
  categoryId? : number

  @Field({nullable:true})
  brandId?: number

}

@InputType()
export class ListingMediaCreateDTO{
  @Field()
  brandId : number

  @Field(()=>[Number], {nullable:true})
  categoryIds: number[]

}

