import { BrandCreateDTO, BrandRemoveDTO, BrandUpdateDTO } from "@/dtos/brand.dto";
import { CategoryArgs, CategoryCreateDTO, CategoryUpdateDTO, PagingArgs } from "@/dtos/category.dto";
import { BrandEntity } from "@/entities/brand.entity";
import { CategoryEntity } from "@/entities/category.entity";
import { HttpException } from "@/exceptions/httpException";
import { Brand, Brands } from "@/interfaces/brand.interface";
import { Categories, Category } from "@/interfaces/category.interface";

import { EntityRepository, In, UpdateResult } from "typeorm";



@EntityRepository(BrandEntity)
export class BrandRepository{

  public async brandList(paging: PagingArgs): Promise<Brands>{
    // const findBrandsAndCount: [BrandEntity[], number] = await BrandEntity.findAndCount({relations:['categories']})
    let sql = BrandEntity.createQueryBuilder("br")
        .select(["br.id", "br.name", "br.slug", "br.description",
                "br.logo", "br.isFeatured", "br.isDeleted"])
        .leftJoinAndSelect('br.categories', 'categories')
        .orderBy('br.id', 'ASC')

    if (paging.starting_after){
    sql = sql.where("br.id > :starting_after", {starting_after: paging.starting_after})
    }else if (paging.ending_before){
    sql = sql.where("br.id < :ending_before", {ending_before: paging.ending_before} )
    }

    const limit:number = Math.min(100, paging.limit?paging.limit: 100)
    sql = sql.limit(limit)

    const findBrands = await sql.getManyAndCount()

    const hasMore = findBrands[0].length === limit;


    return {items: findBrands[0], hasMore: hasMore}

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

  public async brandsRemove(brandData: BrandRemoveDTO): Promise<Brands> {
    // const brandIds = brandData.brandIds
    const updatedResult: UpdateResult = await BrandEntity.update({id: In(brandData.brandIds)}, { isDeleted: true });
    const findBrands: BrandEntity[] = await BrandEntity.find({
      select: ["id", "name", "slug", "description", "logo",  'isDeleted', 'isFeatured'],
      relations: ["parentCategory", "categories"],
      where: {id: In(brandData.brandIds)}
    })
    return {items: findBrands}
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
