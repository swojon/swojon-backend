import { Field, ObjectType } from "type-graphql";


@ObjectType()
export class Location {
  @Field()
  id?: number;

  @Field()
  name?: string;

  @Field({ nullable: true})
  slug?: string;

  @Field({ nullable: true})
  description?: string;

  @Field({ nullable: true})
  banner?: string;

  @Field({ nullable: true})
  parentLocation?:Location;

  @Field({ nullable: true})
  isDeleted?: boolean;

  @Field({ nullable: true})
  isFeatured?: boolean;

  @Field({ nullable: true})
  isLive?: boolean;

}

@ObjectType()
export class NominatimLocation {
  @Field({nullable:true})
  lat?: string 
  @Field({nullable:true})
  lon?: string 
  @Field({nullable:true})
  placeId?: string 
  @Field({nullable:true})
  locality?: string
  @Field({nullable:true})
  displayName?: string 
  @Field({nullable:true})
  city?: string
  @Field({nullable:true})
  stateDistrict?: string
  @Field({nullable:true})
  state ?: string
  @Field({nullable:true})
  country?: string
  @Field({nullable:true})
  postCode?: string
}


@ObjectType()
export class NominatimLocations {
  @Field(type => [NominatimLocation])
  items: NominatimLocation[];
  
}
@ObjectType()
export class Locations {
  @Field(type => [Location])
  items?: Location[];
}
