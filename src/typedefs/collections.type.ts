import { Field, ObjectType } from "type-graphql";
import { Listing } from "./listing.type";

@ObjectType()
export class Collection {
    @Field()
    id?:number;

    @Field({ nullable: true})
    slug?: string;
  
    @Field({ nullable: true})
    description?: string;
  
    @Field({ nullable: true})
    name?: string;

    @Field({ nullable: true})
    banner?: string;

    @Field({ nullable: true})
    isActive?: boolean;
    
    @Field({ nullable: true})
    isFeatured?: boolean;
    
    @Field(()=>[Listing], {nullable:true})
    listings?: Listing[]

}



@ObjectType()
export class Collections {
  @Field(type => [Collection])
  items?: Collection[];

  @Field({nullable:true})
  count?: number

//   @Field()
//   hasMore?: boolean

//   @Field({nullable:true})
//   beforeCursor?:string;

//   @Field({nullable:true})
//   afterCursor?:string;
}
