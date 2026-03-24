import { orderCacheKey } from "@/constants";
import { PagingArgs } from "@/dtos/category.dto";
import { OrderArgs, OrderCreateDTO, OrderUpdateDTO } from "@/dtos/order.dto";
import { MyContext } from "@/interfaces/auth.interface";
import { isLoggedIn } from "@/permission";
import { OrderRepository } from "@/repositories/order.repository";
import { Listings } from "@/typedefs/listing.type";
import { Order, Orders } from "@/typedefs/order.type";
import { getFromCache, invalidateCache, setToCache } from "@/utils/cacheUtility";
import { Arg, Args, Ctx, Mutation, Query, Resolver } from "type-graphql";

@Resolver()
export class OrderResolver extends OrderRepository{

  // @Authorized()
  @Query(() => Orders, {
    description: 'List All Listings',
  })
  async listOrders(@Ctx() ctx:MyContext, @Args() paging: PagingArgs): Promise<Orders> {
    const userId= ctx.user.id;  
    const cacheKey = `${orderCacheKey}:${String(userId)}${JSON.stringify(paging)}`;
    const cachedData = await getFromCache(cacheKey);
    if (cachedData) {
      return cachedData;
    }

    const orders: Orders = await this.orderList(userId, paging);
    await setToCache(cacheKey, orders);
    return orders;
  }

   // @Authorized()
  @Query(() => Orders, {
    description: 'List All Listings',
  })
  async listOrdersAdmin(@Ctx() ctx:MyContext, @Args() paging: PagingArgs): Promise<Listings> {

    const cacheKey = `${orderCacheKey}:${JSON.stringify(paging)}`;
    const cachedData = await getFromCache(cacheKey);
    if (cachedData) {
      return cachedData;
    }

    const orders: Orders = await this.adminOrderList(paging);
    await setToCache(cacheKey, orders);
    return orders;
  }


  // @Authorized()
  @Query(() => Order, {
    description: "Get Order by Id, staus",
  })
  async getOrder(@Args(){orderId}: OrderArgs): Promise<Order> {
   
    if (!!orderId){
      var cacheKey = `${orderCacheKey}:${String(orderId)}`;
      const cachedData = await getFromCache(cacheKey);
      if (cachedData) {
        return cachedData;
      }
    }

    const order: Order = await this.orderFind({orderId});
    var cacheKey = `${orderCacheKey}:${String(order.orderId)}`;
    await setToCache(cacheKey, order);
    
    return order;
  }


  // @Authorized()
  @Mutation(() => Order, {
    description: 'Create Order',
  })
  async createOrder(@Arg('orderData') orderData : OrderCreateDTO,  @Ctx() ctx:MyContext): Promise<Order> {
   
    const userId: number = ctx.user.id;
    // const userId: number = 5; //it is temporary
    const order: Order = await this.orderCreate(userId, orderData);
    await invalidateCache(`${orderCacheKey}*`)
    
    return order;
  }

  @Mutation(() => Order, {
    description: 'Remove Order',
  })
  async removeOrder(@Arg('orderId') orderId: number): Promise<Order> {
    const order: Order = await this.OrderRemove(orderId);
    await invalidateCache(`${orderCacheKey}*`)
    await invalidateCache(`${orderCacheKey}:${String(orderId)}`)
    return order;
  }

  // @Authorized()
  @Mutation(() => Order, {
    description: 'Update Order',
  })
  async updateOrder(@Arg('orderId') orderId: number, @Arg('orderData') orderData: OrderUpdateDTO): Promise<Order> {
    const order: Order = await this.orderUpdate(orderId, orderData);
    await invalidateCache(`${orderCacheKey}*`)
    await invalidateCache(`${orderCacheKey}:${String(orderId)}`)
    return order;
  }
  
}
