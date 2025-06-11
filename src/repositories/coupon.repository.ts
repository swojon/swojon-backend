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
import { CouponCreateDTO, CouponUpdateDTO } from '@/dtos/coupon.dto';
import { Coupon, Coupons } from '@/typedefs/coupon.type';

@EntityRepository(CouponRepository)
export class CouponRepository {
public async couponList(paging: PagingArgs): Promise<Coupons> {
    let sql = CouponEntity.createQueryBuilder('coupon')
      .select(['coupon.id', 'coupon.code',  
        'coupon.discountAmount', 'coupon.isPercantage', 
        'coupon.minimumPurchaseAmount', "coupon.expiresAt",
        "coupon.maxUses", "coupon.maxUsesPerUser", "coupon.isActive"

      ])
      // .leftJoinAndSelect('coupon.communities', 'community')
      .leftJoinAndSelect('coupon.orders', 'orders')
      .leftJoinAndSelect('coupon.usages', 'usages')
      
    let couponCondition: {
      paginationKeys: any;
      order: "DESC" | "ASC"
    } = {
      paginationKeys : ["id"],
      order: "DESC"
    } //default
    if (paging.orderBy === "newest") {
        sql = sql.orderBy('order.id', 'DESC')
      }

    
    
    const limit: number = Math.min(100, paging.limit ?? 100);
    // sql = sql.take(limit);\
    const paginator = buildPaginator({
      entity: CouponEntity,
      paginationKeys: couponCondition.paginationKeys,
      alias: 'coupon',
      query: {
        limit: limit,
        order: couponCondition.order,
        afterCursor: paging?.starting_after ?  String(paging.starting_after) : null ,
        beforeCursor: paging?.starting_after ? String(paging.ending_before) : null,
      },
    });

    const { data:findCoupons, cursor } = await paginator.paginate(sql);
    console.log("data", findCoupons)
    const count = findCoupons.length;
    const hasMore = findCoupons.length === limit;
    const beforeCursor = cursor.beforeCursor;
    const afterCursor = cursor.afterCursor;

    return {
      items: findCoupons,
      hasMore,
      count,
      beforeCursor,
      afterCursor
    };
  }
  

  public async couponFind(code:string): Promise<Coupon> {
    const findCoupon: CouponEntity = await CouponEntity.findOne(
                    {
                      where: [
                          {code: code},
                        ],
                      
                      relations: [
                        "usages", "orders"
                      ],
                    },
                  );
    if (!findCoupon) throw new HttpException(409, `Coupon not found`);
    return findCoupon;
  }


  public async couponCreate(userId: number, orderData: CouponCreateDTO): Promise<Coupon> {
    const existingCoupon = await CouponEntity.findOne({ where: { code: orderData.code } });
    if (existingCoupon) {
        throw new HttpException(409, `Coupon with code ${orderData.code} already exists`);
    }
    const newCoupon = await CouponEntity.create({
        code : orderData.code,
        discountAmount: orderData.discountAmount,    
        expiresAt : orderData.expiresAt,    
        isPercantage: orderData.isPercantage ?? false, 
    }).save();

    if (orderData.minimumPurchaseAmount) newCoupon.minimumPurchaseAmount = orderData.minimumPurchaseAmount;
    if (orderData.maxUses) newCoupon.maxUses = orderData.maxUses;
    if (orderData.maxUsesPerUser) newCoupon.maxUsesPerUser = orderData.maxUsesPerUser;
    
    await newCoupon.save();

    // Fetch the created order with relations to return as response
    const createdCoupon = await CouponEntity.findOne({
      where: { code: newCoupon.code },
      relations: [
        'usages',
        'orders'
      ],
    });
 
    return createdCoupon;
 
    
  }

  public async couponUpdate(couponId: number, couponData: CouponUpdateDTO ): Promise<Coupon> {
    const coupon = await CouponEntity.findOne({
        where: { id: couponId },
        relations: ['usages', 'orders'],
    });
    if (!coupon) {
        throw new HttpException(404, `Coupon with id ${couponId} not found`);
    }
    
    if (couponData.minimumPurchaseAmount) coupon.minimumPurchaseAmount = couponData.minimumPurchaseAmount;
    if (couponData.expiresAt) coupon.expiresAt = couponData.expiresAt;
    if (couponData.maxUses) coupon.maxUses = couponData.maxUses;
    if (couponData.maxUsesPerUser) coupon.maxUsesPerUser = couponData.maxUsesPerUser;
    if (couponData.discountAmount) coupon.discountAmount = couponData.discountAmount;
    if (couponData.isPercantage) coupon.isPercantage = couponData.isPercantage;
    if (couponData.isActive) coupon.isActive = couponData.isActive;
    
    await coupon.save()

    const updatedCoupon = await CouponEntity.findOne({
        where: { id: couponId },
        relations: ['usages', 'orders'],
    });

    return updatedCoupon;
    
  }

 
  public async couponRemove(couponId: number): Promise<Coupon> {
    const findCoupon:CouponEntity = await CouponEntity.findOne({ where: { id: couponId } });
    if (!findCoupon) throw new HttpException(409, `Coupon with id ${couponId} does not exist`);
    
    await findCoupon.softRemove();
    return findCoupon ;
  }

}
