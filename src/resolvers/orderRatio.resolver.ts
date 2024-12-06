
import { OrderRatioCheckDTO } from "@/dtos/orderRatio.dto";
import { OrderRatioRepository } from "@/repositories/orderRatio.repository";
import { OrderRatio } from "@/typedefs/orderRatio.type";
import { Arg, Query, Resolver } from "type-graphql";

@Resolver()
export class OrderRatioResolver extends OrderRatioRepository{

  @Query(() => OrderRatio, {
    description: "Search for order Ratio"
  })
  async checkOrderRatio(@Arg('orderRatioQuery') orderRatioQuery : OrderRatioCheckDTO) : Promise<OrderRatio>{
    const orderRatio = await this.orderRatioCheck(orderRatioQuery)
    return orderRatio
  }

}
