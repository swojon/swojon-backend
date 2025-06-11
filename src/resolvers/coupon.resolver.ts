import { couponCacheKey } from "@/constants";
import { PagingArgs } from "@/dtos/category.dto";
import { CouponCreateDTO, CouponUpdateDTO } from "@/dtos/coupon.dto";
import { MyContext } from "@/interfaces/auth.interface";
import { isLoggedIn } from "@/permission";
import { CouponRepository } from "@/repositories/coupon.repository";
import { Coupon, Coupons } from "@/typedefs/coupon.type";
import { getFromCache, invalidateCache, setToCache } from "@/utils/cacheUtility";
import { Arg, Args, Ctx, Mutation, Query, Resolver } from "type-graphql";

@Resolver()
export class CouponResolver extends CouponRepository{

  // @Authorized()
  @Query(() => Coupons, {
    description: 'List All Coupons',
  })
  async listCoupons(@Ctx() ctx:MyContext, @Args() paging: PagingArgs): Promise<Coupons> {
    const userId= ctx.user.id;  
    // const cacheKey = `${couponCacheKey}:${JSON.stringify(paging)}`;
    // const cachedData = await getFromCache(cacheKey);
    // if (cachedData) {
    //   return cachedData;
    // }

    const coupons: Coupons = await this.couponList(paging);
    // await setToCache(cacheKey, coupons);
    return coupons;
  }

  
  // @Authorized()
  @Query(() => Coupon, {
    description: "Get Coupon by code",
  })
  async getCoupon(@Ctx() ctx:MyContext ,@Arg("code") code:string): Promise<Coupon> {
    const userId = ctx.user?.id
    if (!!code){
      var cacheKey = `${couponCacheKey}:${String(code)}`;
      const cachedData = await getFromCache(cacheKey);
      if (cachedData) {
        return cachedData;
      }
    }

    const coupon: Coupon = await this.couponFind(code);
    var cacheKey = `${couponCacheKey}:${String(coupon.id)}`;
    await setToCache(cacheKey, coupon);
    
    return coupon;
  }


  // @Authorized()
  @Mutation(() => Coupon, {
    description: 'Create Coupon',
  })
  async createCoupon(@Arg('couponData') couponData : CouponCreateDTO,  @Ctx() ctx:MyContext): Promise<Coupon> {
    if (!isLoggedIn(ctx.user)) {
      throw new Error("You don't have permission to access this resource");
    }
    const userId: number = ctx.user.id;
    // const userId: number = 5; //it is temporary
    const coupon: Coupon = await this.couponCreate(userId, couponData);
    await invalidateCache(`${couponCacheKey}*`)
    
    return coupon;
  }

  @Mutation(() => Coupon, {
    description: 'Remove Coupn',
  })
  async removeCoupon(@Arg('couponId') couponId: number): Promise<Coupon> {
    const coupon: Coupon = await this.couponRemove(couponId);
    await invalidateCache(`${couponCacheKey}*`)
    await invalidateCache(`${couponCacheKey}:${String(couponId)}`)
    return coupon;
  }

  // @Authorized()
  @Mutation(() => Coupon, {
    description: 'Update Order',
  })
  async updateCoupon(@Arg('couponId') couponId: number, @Arg('couponData') couponData: CouponUpdateDTO): Promise<Coupon> {
    const coupon: Coupon = await this.couponUpdate(couponId, couponData);
    await invalidateCache(`${couponCacheKey}*`)
    await invalidateCache(`${couponCacheKey}:${String(couponId)}`)
    return coupon;
  }
  
}
