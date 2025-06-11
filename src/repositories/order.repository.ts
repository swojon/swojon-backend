import { PagingArgs } from '@/dtos/category.dto';
import { ProductVariantEntity } from '@/entities/listing.entity';
import { HttpException } from '@/exceptions/httpException';
import { EntityRepository } from 'typeorm';
import { buildPaginator } from 'typeorm-cursor-pagination';
import { Webhook, MessageBuilder } from 'discord-webhook-node';

import { OrderEntity, OrderItemEntity } from '@/entities/order.entity';
import { Order, Orders } from '@/typedefs/order.type';
import { OrderArgs, OrderCreateDTO, OrderUpdateDTO } from '@/dtos/order.dto';
import { CouponEntity } from '@/entities/coupon.entity';

@EntityRepository(OrderEntity)
export class OrderRepository {
public async adminOrderList(paging: PagingArgs): Promise<Orders> {
    let sql = OrderEntity.createQueryBuilder('order')
      .select(['order.id', 'order.shippingAddress',  
        'order.totalAmount', 'order.finalAmount', 
        'order.status', "order.createdAt",
      ])
      // .leftJoinAndSelect('order.communities', 'community')
      .leftJoinAndSelect('order.user', 'user')
      .leftJoinAndSelect('order.coupon', 'coupon')
      .leftJoinAndSelect('order.items', 'items')
      .leftJoinAndSelect("items.listing", "listing")
      .leftJoinAndSelect('items.variant', "variant")
      
    let orderCondition: {
      paginationKeys: any;
      order: "DESC" | "ASC"
    } = {
      paginationKeys : ["id"],
      order: "DESC"
    } //default
    if (paging.orderBy){
      if (paging.orderBy === "highest"){
        sql = sql.orderBy('order.finalAmount', 'DESC')
        orderCondition.paginationKeys = ["price", "id"]
        orderCondition.order = "DESC"
      } 
      else if (paging.orderBy === "lowest") {
        sql = sql.orderBy('order.finalAmount', 'ASC')
        orderCondition.paginationKeys = ["price", "id"]
        orderCondition.order = "ASC"
      }
      if (paging.orderBy === "newest") {
        sql = sql.orderBy('order.id', 'DESC')
      }

    }
    
    const limit: number = Math.min(100, paging.limit ?? 100);
    // sql = sql.take(limit);\
    const paginator = buildPaginator({
      entity: OrderEntity,
      paginationKeys: orderCondition.paginationKeys,
      alias: 'order',
      query: {
        limit: limit,
        order: orderCondition.order,
        afterCursor: paging?.starting_after ?  String(paging.starting_after) : null ,
        beforeCursor: paging?.starting_after ? String(paging.ending_before) : null,
      },
    });

    const { data:findOrders, cursor } = await paginator.paginate(sql);
    console.log("data", findOrders)
    const count = findOrders.length;
    const hasMore = findOrders.length === limit;
    const beforeCursor = cursor.beforeCursor;
    const afterCursor = cursor.afterCursor;

    return {
      items: findOrders,
      hasMore,
      count,
      beforeCursor,
      afterCursor
    };
  }
  
  public async orderList(userId:any, paging: PagingArgs): Promise<Orders> {
    let sql = OrderEntity.createQueryBuilder('order')
      .select(['order.id', 'order.shippingAddress',  
        'order.totalAmount', 'order.finalAmount', 
        'order.status', "order.createdAt", 'order.shipping'
      ])
      // .leftJoinAndSelect('order.communities', 'community')
      .leftJoinAndSelect('order.user', 'user')
      .leftJoinAndSelect('order.coupon', 'coupon')
      .leftJoinAndSelect('order.items', 'items')
      .leftJoinAndSelect("items.listing", "listing")
      .leftJoinAndSelect('items.variant', "variant")
      .leftJoinAndSelect("variant.optionValues", "optionValues")
      .leftJoinAndSelect("variant.media", "media")
      .where("user.id = :userId", {userId: userId})
    
    let orderCondition: {
      paginationKeys: any;
      order: "DESC" | "ASC"
    } = {
      paginationKeys : ["id"],
      order: "DESC"
    } //default
    if (paging.orderBy){
      if (paging.orderBy === "highest"){
        sql = sql.orderBy('order.finalAmount', 'DESC')
        orderCondition.paginationKeys = ["price", "id"]
        orderCondition.order = "DESC"
      } 
      else if (paging.orderBy === "lowest") {
        sql = sql.orderBy('order.finalAmount', 'ASC')
        orderCondition.paginationKeys = ["price", "id"]
        orderCondition.order = "ASC"
      }
      if (paging.orderBy === "newest") {
        sql = sql.orderBy('order.id', 'DESC')
      }

    }
    
    const limit: number = Math.min(100, paging.limit ?? 100);
    // sql = sql.take(limit);\
    const paginator = buildPaginator({
      entity: OrderEntity,
      paginationKeys: orderCondition.paginationKeys,
      alias: 'order',
      query: {
        limit: limit,
        order: orderCondition.order,
        afterCursor: paging?.starting_after ?  String(paging.starting_after) : null ,
        beforeCursor: paging?.starting_after ? String(paging.ending_before) : null,
      },
    });

    const { data:findOrders, cursor } = await paginator.paginate(sql);
    console.log("data", findOrders)
    const count = findOrders.length;
    const hasMore = findOrders.length === limit;
    const beforeCursor = cursor.beforeCursor;
    const afterCursor = cursor.afterCursor;

    return {
      items: findOrders,
      hasMore,
      count,
      beforeCursor,
      afterCursor
    };
  }

  public async orderFind(userId:any,orderArgs: OrderArgs): Promise<Order> {
    const findOrder: OrderEntity = await OrderEntity.findOne(
                    {
                      where: [
                          {id: orderArgs?.id,},
                          {status: orderArgs?.status},
                        ],
                      
                      relations: [
                        "user", "user.profile",
                        "coupon", "items", "items.variant",
                        "variant.listing", "items.variant.optionValues"
                        ],
                    },
                  );
    if (!findOrder) throw new HttpException(409, `Order not found`);
    return findOrder;
  }

  public async applyCoupon(code: string, userId: number): Promise<CouponEntity> {
  const coupon = await CouponEntity.findOne({
    where: { code },
    relations: ['usages'],
  });

  if (!coupon) throw new Error('Coupon not found');

  if (coupon.expiresAt && new Date() > coupon.expiresAt) {
    throw new Error('Coupon expired');
  }

  const totalUses = coupon.usages.length;
  if (coupon.maxUses && totalUses >= coupon.maxUses) {
    throw new Error('Coupon usage limit reached');
  }

  const userUses = coupon.usages.filter(u => u.user.id === userId).length;
  if (coupon.maxUsesPerUser && userUses >= coupon.maxUsesPerUser) {
    throw new Error('You have already used this coupon');
  }

  return coupon;
}

  public async orderCreate(userId: number, orderData: OrderCreateDTO): Promise<Order> {
    let appliedCoupon = null;
    if (orderData.couponCode) {
        try {
            appliedCoupon = await this.applyCoupon( orderData.couponCode, userId)
        } catch (error) {
            throw new HttpException(409, error.message)
        }
    }

    let totalAmount = 0;
    let items = [];

    for (const item of orderData.items) {
        const variant = await ProductVariantEntity.findOne({
            where: { id: item.variantId },
            relations: ['listing'],
        });
        if (!variant) {
            throw new HttpException(409, `Variant with id ${item.variantId} does not exist`);
        }
        const salePrice = variant.salePrice ?? variant.price;
        const itemTotal = salePrice * (item.quantity ?? 1);
        totalAmount += itemTotal;

        items.push({
            variant,
            listing: variant.listing,
            quantity: item.quantity ?? 1,
            price: salePrice,
            total: itemTotal,
        });
    }

    let finalAmount = totalAmount + orderData.shipping;
    if (appliedCoupon) {
        // Assume coupon has a discountType ('percentage' or 'fixed') and discountValue
        if (appliedCoupon.isParcentage) {
            finalAmount = totalAmount - (totalAmount * (appliedCoupon.discountAmount / 100));
        } else {
            finalAmount = totalAmount - appliedCoupon.discountAmount;
        }
        if (finalAmount < 0) finalAmount = 0;
    }

    const newOrder = await OrderEntity.create({
        user: { id: userId },
        shippingAddress: {
            name: orderData.name,
            phoneNumber: orderData.phoneNumber,
            address : orderData.address,
            policeStation : orderData.policeStation,
            district : orderData.district
        },
        totalAmount,
        finalAmount,
        shipping:orderData.shipping,
        status: 'pending',
        coupon: appliedCoupon ?? null,
    }).save();

    // Save order items
    for (const item of items) {
        await OrderItemEntity.create({
            order:newOrder,
            listing: item.listing,
            variant: item.variant,
            quantity: item.quantity,
            price: item.price,
            total: item.total
        }).save();
    }

    // Update coupon usages if applied
    if (appliedCoupon) {
      appliedCoupon.usages.push({ user: { id: userId }, coupon: appliedCoupon });
      await CouponEntity.save(appliedCoupon);
    }

    // Fetch the created order with relations to return as response
    const createdOrder = await OrderEntity.findOne({
      where: { id: newOrder.id },
      relations: [
        'user',
        'coupon',
        'items',
        'items.variant',
        'items.variant.listing'
      ],
    });
    
    setTimeout(() => this.notifyOrderCreation(createdOrder), 500);

    return createdOrder;
 
    
  }

  private async notifyOrderCreation(orderData: OrderEntity){
    const webhook_link = process.env.NEW_LISTING_DISCORD_WEBHOOK;
    if (!webhook_link) return 
    const hook = new Webhook(webhook_link);
    if (!orderData) return;

    const orderId = orderData.id;
    const user = orderData.user;
    const coupon = orderData.coupon;
    const items = orderData.items || [];
    const shipping: {
        name?: string;
        phoneNumber?: string;
        address?: string;
        policeStation?: string;
        district?: string;
    } = orderData.shippingAddress || {};
    const totalAmount = orderData.totalAmount;
    const finalAmount = orderData.finalAmount;
    const status = orderData.status;
    const createdAt = orderData.createdAt;

    const title = `🛒 New Order #${orderId}`;
    
    let description = `**Order ID:** ${orderId}\n`;
    description += `**User:** ${user?.profile?.name || user?.email || "N/A"} (ID: ${user?.id})\n`;
    description += `**Status:** ${status}\n`;
    description += `**Created At:** ${createdAt?.toLocaleString?.() || createdAt}\n\n`;

    description += `**Shipping Address:**\n`;
    description += `${shipping.name || ""}\n${shipping.phoneNumber || ""}\n${shipping.address || ""}\n${shipping.policeStation || ""}, ${shipping.district || ""}\n\n`;

    description += `**Items:**\n`;
    for (const item of items) {
        const variant = item.variant;
        const listing = variant?.listing;
        description += `- ${listing?.title || "Product"} (x${item.quantity}) - ৳${item.price}\n`;
    }

    if (coupon) {
        description += `\n**Coupon:** ${coupon.code} ( ${coupon.discountAmount})\n`;
    }

    description += `\n**Total:** ৳${totalAmount}\n`;
    description += `**Final Amount:** ৳${finalAmount}\n`;

    let thumbnails: string[] = [];
    if (items.length > 0 && items[0].variant?.listing?.media?.length > 0) {
        thumbnails = items[0].variant.listing.media.map((m: any) => m.url);
    }

    var embed = new MessageBuilder()
        .setTitle(title)
       
        .setDescription(description)
        .setFooter('Swojon Order Alert')
        .setTimestamp();

    if (thumbnails && thumbnails[0]) {
        embed = embed.setThumbnail(thumbnails[0]);
    }
      try{      
        hook.send(embed)
      } catch(e){}
  }

  public async orderUpdate(orderId: number, orderData: OrderUpdateDTO ): Promise<Order> {
    const order = await OrderEntity.findOne({
        where: { id: orderId },
        relations: ['user', 'coupon', 'items', 'items.variant', 'items.variant.listing'],
    });
    if (!order) {
        throw new HttpException(404, `Order with id ${orderId} not found`);
    }

    if (orderData.status) {
        order.status = orderData.status;
    }

    if (orderData.trackingNumber) {
        order.trackingNumber = orderData.trackingNumber
    }

    if (orderData.paymentStatus) order.paymentStatus  = orderData.paymentStatus
    if (orderData.notes) order.notes = orderData.notes;

    await order.save();

    const updatedOrder = await OrderEntity.findOne({
        where: { id: orderId },
        relations: ['user', 'coupon', 'items', 'items.variant', 'items.variant.listing'],
    });

    return updatedOrder;
    
  }

 
  public async OrderRemove(listingId: number): Promise<Order> {
    const findOrder: OrderEntity = await OrderEntity.findOne({ where: { id: listingId } });
    if (!findOrder) throw new HttpException(409, `Listing with id ${listingId} does not exist`);
    
    await findOrder.softRemove();
    return findOrder ;
  }

}
