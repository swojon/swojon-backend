import { Field, ObjectType } from "type-graphql";

@ObjectType()
export class CourierData {
    @Field({nullable:true})
    total_parcel?: number;
  
    @Field({nullable:true})
    success_parcel?: number;
  
    @Field({nullable:true})
    cancelled_parcel?: number;
    
    @Field({nullable:true})
    success_ratio?: number;
}

@ObjectType()
export class OrderRatio {
    @Field()
    success: boolean;

    @Field({nullable:true})
    total_parcel?: number;

    @Field({nullable:true})
    success_parcel?: number;

    @Field({nullable:true})
    cancelled_parcel?: number;
    
    @Field({nullable:true})
    success_ratio?: number;

    @Field({nullable:true})
    pathao?:CourierData;

    @Field({nullable:true})
    steadfast?:CourierData;

    @Field({nullable:true})
    paperfly?:CourierData;

    @Field({nullable:true})
    redx?:CourierData;
}


