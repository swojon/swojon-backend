import { BrandCreateDTO, BrandUpdateDTO } from "@/dtos/brand.dto";
import { CategoryArgs, CategoryCreateDTO, CategoryUpdateDTO } from "@/dtos/category.dto";
import { BrandEntity } from "@/entities/brand.entity";
import { CategoryEntity } from "@/entities/category.entity";
import { HttpException } from "@/exceptions/httpException";
import { Brand, Brands } from "@/interfaces/brand.interface";
import { Categories, Category } from "@/interfaces/category.interface";

import { EntityRepository, In } from "typeorm";



@EntityRepository(BrandEntity)
export class BrandRepository{

  public async brandList(): Promise<Brands>{
    const findBrandsAndCount: [BrandEntity[], number] = await BrandEntity.findAndCount({relations:['categories']})

    return {
      items: findBrandsAndCount[0],
      count: findBrandsAndCount[1]
    }
  }

  public async brandAdd(brandData: BrandCreateDTO): Promise<Brand>{
    const findBrand:BrandEntity = await BrandEntity.findOne({
      where: [{name: brandData?.name}, {slug: brandData?.slug}]
    })
    if (findBrand) throw new HttpException(409, `Brand with name ${brandData.name} already exists`);
    const createBrandData: BrandEntity = await BrandEntity.create(brandData).save()
    return createBrandData
  }

  public async brandUpdate(brandId:number, brandData: BrandUpdateDTO): Promise<Brand>{
    const findBrand:BrandEntity = await BrandEntity.findOne({
      where: {id: brandId}
    })

    if (!findBrand) throw new HttpException(409, `Brand with id ${brandId} does not exist`);

    await BrandEntity.update({ id: brandId }, brandData);

    const updatedBrand: CategoryEntity = await CategoryEntity.findOne({ where: { id: brandId }, relations: ['categories'] });
    return updatedBrand;

  }

  public async brandCategoryAdd(brandId:number, categorieIds:number[]): Promise<Brand>{
    const findBrand:BrandEntity = await BrandEntity.findOne({
      where: {id: brandId},
      relations: ["categories"]
    })
    const CategoriesIdToAdd:number[] = categorieIds.filter(catId => findBrand.categories.filter(cat=> cat.id !== catId))
    // console.log(CategoriesIdToAdd)
    if (!CategoriesIdToAdd) throw new HttpException(409, "No Categories To Add")
    console.log(CategoriesIdToAdd)

    const CategoriesToAdd: CategoryEntity[] = await CategoryEntity.find({where: {id: In(CategoriesIdToAdd)}});
    // console.log(CategoriesToAdd)
    console.log(CategoriesToAdd)
    findBrand.categories = [...findBrand.categories, ...CategoriesToAdd]
    const SavedBrand = await BrandEntity.save(findBrand)

    return SavedBrand
  }

  public async brandCategoryRemove(brandId: number, categories:number[]):Promise<Brand>{
    const findBrand:BrandEntity = await BrandEntity.findOne({
      where: {id: brandId},
      relations: ["categories"]
    })
    findBrand.categories = findBrand.categories.filter(cat => !categories.includes(cat.id))
    const SavedBrand = await BrandEntity.save(findBrand)
    return SavedBrand
  }


  public async brandRemove(brandId: number): Promise<Brand> {
    const findBrand: BrandEntity = await BrandEntity.findOne({ where: { id: brandId } });
    if (!findBrand) throw new HttpException(409, `Brand with id ${brandId} does not exist`);

    await CategoryEntity.delete({ id: brandId });

    return findBrand;
  }

  public async categoryFind(categoryArgs: CategoryArgs): Promise<CategoryEntity> {
    const findCategory: CategoryEntity = await CategoryEntity.findOne(
                    {
                      where: [
                          {id: categoryArgs?.id},
                          {slug: categoryArgs?.slug},
                          {name: categoryArgs?.name}],
                      relations: ['parentCategory']
                    },

              );
    if (!findCategory) throw new HttpException(409, `Category not found`);
    return findCategory;
  }

}
