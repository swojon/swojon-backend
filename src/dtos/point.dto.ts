
import { TRANSACTION_TYPE } from "@/entities/points.entity";
import { Field, InputType, registerEnumType } from "type-graphql";
import { Column } from "typeorm";

registerEnumType(TRANSACTION_TYPE, {
  name: "TRANSACTION_TYPE",
  description: "ENUM for point Transaction Type"
})


@InputType()
export class PointCreateDTO {
    @Field()
    userId: number;

    @Field()
    amount: number;

    @Field({nullable:true})
    description?: string;

    @Column({nullable:true})
    validity?: number;

    @Column({nullable:true})
    isPlus?: boolean

}

@InputType()
export class PointDeductDTO {
    @Field()
    userId: number;

    @Field()
    amount: number;

    @Field({nullable:true})
    description?: string;

}

@InputType()
export class PointUpdateDTO {
    @Field({nullable:true})
    isBlocked?: boolean;

    @Field({nullable:true})
    consumed?:number;

    @Field({nullable: true})
    description?: string;

    @Column()
    expireAt: Date;

    @Column({nullable:true})
    isPlus: true

}

