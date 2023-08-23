
import { ListingCreateDTO, ListingUpdateDTO } from "@/dtos/listing.dto";
import { BrandEntity } from "@/entities/brand.entity";
import { CategoryEntity } from "@/entities/category.entity";
import { CommunityEntity } from "@/entities/community.entity";
import { ListingEntity } from "@/entities/listing.entity";
import { UserEntity } from "@/entities/users.entity";
import { HttpException } from "@/exceptions/httpException";
import { Listing, Listings } from "@/interfaces/listing.interface";

import { EntityRepository, In } from "typeorm";


@EntityRepository(ListingEntity)
export class ListingRepository{

  public async listingList(): Promise<Listings>{
    const findListingsAndCount: [ListingEntity[], number] = await ListingEntity.findAndCount({relations:["communities", 'user', 'brand', 'category']})

    return {
      items: findListingsAndCount[0],
      count: findListingsAndCount[1]
    }
  }

  public async listingAdd(userId:number, listingData: ListingCreateDTO): Promise<Listing>{
    let communities: CommunityEntity[] = [];
    let brand: BrandEntity|null = null;
    const findUser: UserEntity = await UserEntity.findOne({ where: { id: userId} });
    if (!findUser)  throw new HttpException(409, `User with id ${userId} does not exist`);


    if (listingData.brandId){
      console.log(listingData.brandId)
      const findBrand : BrandEntity = await BrandEntity.findOne({ where: {id: listingData.brandId} })
      console.log(findBrand)
      if (!findBrand) throw new HttpException(409, `Brand with id ${listingData.brandId} does not exist`);
      brand = findBrand;
    }

    if (listingData.communityIds){
      communities = await CommunityEntity.findByIds(listingData.communityIds)
    }

    const findCategory: CategoryEntity = await CategoryEntity.findOne({
      where: {id: listingData.categoryId}
    })
    if (!findCategory) throw new HttpException(409, `Category with id ${listingData.categoryId} does not exist`);

    const createListingData: ListingEntity = await ListingEntity.create({...listingData, category:findCategory, brand, communities, user:findUser}).save()
    return createListingData
  }

  public async listingUpdate(listingId:number, listingData: ListingUpdateDTO): Promise<Listing>{
    let dataToUpdate:any = listingData;

    const findListing : ListingEntity = await ListingEntity.findOne({where: {id: listingId}})
    if (!findListing) throw new  HttpException(409, `Listing with id ${listingId} does not exist`);

    if (listingData.communityIds){
      const communities = await CommunityEntity.findByIds(listingData.communityIds)
      findListing.communities = communities
      await findListing.save()

      delete dataToUpdate.communityIds
    }

    if (listingData.brandId){
      const findBrand : BrandEntity = await BrandEntity.findOne({ where: {id: listingData.brandId} })
      if (!findBrand) throw new HttpException(409, `Brand with id ${listingData.brandId} does not exist`);
      console.log(findBrand)
      dataToUpdate = {...dataToUpdate, brand:findBrand}
      delete dataToUpdate.brandId
    }

    if (listingData.categoryId){
      const findCategory = await CategoryEntity.findOne({
        where: {id: listingData.categoryId}
      })
      if (!findCategory) throw new HttpException(409, `Category with id ${listingData.categoryId} does not exist`);
      dataToUpdate = {...dataToUpdate, category:findCategory}

      delete dataToUpdate.categoryId
    }

    // await findListing.save()
    if (Object.keys(dataToUpdate).length !== 0) await ListingEntity.update({ id: listingId },  dataToUpdate);

    const updatedListing: ListingEntity = await ListingEntity.findOne({ where: { id: listingId },relations: [ "communities", 'user', 'brand', 'category' ] });
    return updatedListing;

  }

  // public async brandCategoryAdd(brandId:number, categorieIds:number[]): Promise<Brand>{
  //   const findBrand:BrandEntity = await BrandEntity.findOne({
  //     where: {id: brandId},
  //     relations: ["categories"]
  //   })
  //   const CategoriesIdToAdd:number[] = categorieIds.filter(catId => findBrand.categories.filter(cat=> cat.id !== catId))
  //   // console.log(CategoriesIdToAdd)
  //   if (!CategoriesIdToAdd) throw new HttpException(409, "No Categories To Add")
  //   console.log(CategoriesIdToAdd)

  //   const CategoriesToAdd: CategoryEntity[] = await CategoryEntity.find({where: {id: In(CategoriesIdToAdd)}});
  //   // console.log(CategoriesToAdd)
  //   console.log(CategoriesToAdd)
  //   findBrand.categories = [...findBrand.categories, ...CategoriesToAdd]
  //   const SavedBrand = await BrandEntity.save(findBrand)

  //   return SavedBrand
  // }

  // public async brandCategoryRemove(brandId: number, categories:number[]):Promise<Brand>{
  //   const findBrand:BrandEntity = await BrandEntity.findOne({
  //     where: {id: brandId},
  //     relations: ["categories"]
  //   })
  //   findBrand.categories = findBrand.categories.filter(cat => !categories.includes(cat.id))
  //   const SavedBrand = await BrandEntity.save(findBrand)
  //   return SavedBrand
  // }


  // public async brandRemove(brandId: number): Promise<Brand> {
  //   const findBrand: BrandEntity = await BrandEntity.findOne({ where: { id: brandId } });
  //   if (!findBrand) throw new HttpException(409, `Brand with id ${brandId} does not exist`);

  //   await CategoryEntity.delete({ id: brandId });

  //   return findBrand;
  // }

  // public async categoryFind(categoryArgs: CategoryArgs): Promise<CategoryEntity> {
  //   const findCategory: CategoryEntity = await CategoryEntity.findOne(
  //                   {
  //                     where: [
  //                         {id: categoryArgs?.id},
  //                         {slug: categoryArgs?.slug},
  //                         {name: categoryArgs?.name}],
  //                     relations: ['parentCategory']
  //                   },

  //             );
  //   if (!findCategory) throw new HttpException(409, `Category not found`);
  //   return findCategory;
  // }

}
