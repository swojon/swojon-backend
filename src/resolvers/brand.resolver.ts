
import { BrandCategoryInput, BrandCreateDTO, BrandOptionsArgs, BrandRemoveDTO, BrandUpdateDTO } from "@/dtos/brand.dto";
import { PagingArgs } from "@/dtos/category.dto";
import { MyContext } from "@/interfaces/auth.interface";
import { hasActionPermission, isModerator } from "@/permission";
import { BrandRepository } from "@/repositories/brand.repository";
import { Brand, Brands } from "@/typedefs/brand.type";
import { Arg, Args, Authorized, Ctx, Mutation, Query, Resolver } from "type-graphql";

@Resolver()
export class BrandResolver extends BrandRepository{

  // @Authorized()
  @Query(() => Brands, {
    description: 'List All Brands',
  })
  async listBrands(@Args() paging: PagingArgs): Promise<Brands> {
      const brands: Brands = await this.brandList(paging);
      return brands;
  }

   // @Authorized()
   @Query(() => Brands, {
    description: 'List All Brands',
  })
  async listBrandOptions(@Args() option: BrandOptionsArgs): Promise<Brands> {
      const brands: Brands = await this.brandOptionList(option);
      return brands;
  }

  // @Authorized()
  @Mutation(() => Brand, {
    description: 'Create Brand',
  })
  async createBrand(@Arg('brandData') brandData : BrandCreateDTO, @Ctx() ctx: MyContext): Promise<Brand> {
    if (!isModerator(ctx.user)) {
      throw new Error("You don't have permission to access this resource");
    }

    const brand: Brand = await this.brandAdd(brandData);
    return brand;
  }

  // @Authorized()
  // @Query(() => Category, {
  //   description: "Get Category by Id, slug or name",
  // })
  // async getCategory(@Args(){id, slug, name}: CategoryArgs): Promise<Category> {
  //   const category: Category = await this.categoryFind({id, slug, name});
  //   return category;
  // }

  // @Authorized()
  @Mutation(()=>Brand, {
    description: "Add category of brand"
  })
  async addBrandCategory(@Arg('inputData') inputData: BrandCategoryInput, @Ctx() ctx: MyContext): Promise<Brand>{
    //moderator can add category to brand
    if (!isModerator(ctx.user)) {
      throw new Error("You don't have permission to access this resource");
    }
    const brand: Brand = await this.brandCategoryAdd(inputData.brandId, inputData.categoryIds)
    return brand
  }
//
  // @Authorized()
  @Mutation(()=>Brand, {
    description: "Remove category of brand"
  })
  async removeBrandCategory(@Arg('inputData') inputData: BrandCategoryInput, @Ctx() ctx: MyContext) : Promise<Brand>{
    //moderator can remove category from brand
    if (!isModerator(ctx.user)) {
      throw new Error("You don't have permission to access this resource");
    }
    const brand: Brand = await this.brandCategoryRemove(inputData.brandId, inputData.categoryIds)
    return brand
  }


  // @Authorized()
  @Mutation(() => Brand, {
    description: 'Remove Brand',
  })
  async removeBrand(@Arg('brandId') brandId: number, @Ctx() ctx: MyContext): Promise<Brand> {
    //moderator can remove brand
    if (!isModerator(ctx.user)) {
      throw new Error("You don't have permission to access this resource");
    }
    const brand: Brand = await this.brandRemove(brandId);
    return brand;
  }

  @Mutation(() => Brands, {
    description: 'Remove Categories',
  })
  async removeBrands(@Arg('brandData') brandData: BrandRemoveDTO, @Ctx() ctx: MyContext): Promise<Brands> {
    //moderator can remove brands
    if (!isModerator(ctx.user)) {
      throw new Error("You don't have permission to access this resource");
    }
    const brands: Brands = await this.brandsRemove(brandData);
    return brands;
  }


  // @Authorized()
  @Mutation(() => Brand, {
    description: 'Update Brand',
  })
  async updateBrand(@Arg('brandId') brandId: number, @Arg('brandData') brandData: BrandUpdateDTO, @Ctx() ctx: MyContext): Promise<Brand> {
    //moderator can update brand
    if (!isModerator(ctx.user)) {
      throw new Error("You don't have permission to access this resource");
    }
    const brand: Brand = await this.brandUpdate(brandId, brandData);
    return brand;
  }
}
