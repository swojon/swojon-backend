
import { BrandCategoryInput, BrandCreateDTO, BrandUpdateDTO } from "@/dtos/brand.dto";
import { BrandRepository } from "@/repositories/brand.repository";
import { Brand, Brands } from "@/typedefs/brand.type";
import { Arg, Args, Authorized, Mutation, Query, Resolver } from "type-graphql";

@Resolver()
export class BrandResolver extends BrandRepository{

  @Authorized()
  @Query(() => Brands, {
    description: 'List All Brands',
  })
  async listBrands(): Promise<Brands> {
      const brands: Brands = await this.brandList();
      return brands;
  }

  @Authorized()
  @Mutation(() => Brand, {
    description: 'Create Category',
  })
  async createBrand(@Arg('brandData') brandData : BrandCreateDTO): Promise<Brand> {
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

  @Authorized()
  @Mutation(()=>Brand, {
    description: "Add category of brand"
  })
  async addBrandCategory(@Arg('inputData') inputData: BrandCategoryInput): Promise<Brand>{
    const brand: Brand = await this.brandCategoryAdd(inputData.brandId, inputData.categoryIds)
    return brand
  }

  @Authorized()
  @Mutation(()=>Brand, {
    description: "Remove category of brand"
  })
  async removeBrandCategory(@Arg('inputData') inputData: BrandCategoryInput) : Promise<Brand>{
    const brand: Brand = await this.brandCategoryRemove(inputData.brandId, inputData.categoryIds)
    return brand
  }


  @Authorized()
  @Mutation(() => Brand, {
    description: 'Remove Category',
  })
  async removeCategory(@Arg('brandId') brandId: number): Promise<Brand> {
    const brand: Brand = await this.brandRemove(brandId);
    return brand;
  }

  @Authorized()
  @Mutation(() => Brand, {
    description: 'Update Brand',
  })
  async updateBrand(@Arg('brandId') brandId: number, @Arg('brandData') brandData: BrandUpdateDTO): Promise<Brand> {
    const brand: Brand = await this.brandUpdate(brandId, brandData);
    return brand;
  }
}
