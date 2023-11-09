
import { ListingCreateDTO, ListingUpdateDTO } from "@/dtos/listing.dto";
import { BrandEntity } from "@/entities/brand.entity";
import { CategoryEntity } from "@/entities/category.entity";
import { CommunityEntity } from "@/entities/community.entity";
import { ListingEntity } from "@/entities/listing.entity";
import { ListingMediaEntity } from "@/entities/listingMedia.entity";
import { LocationEntity } from "@/entities/location.entity";
import { UserEntity } from "@/entities/users.entity";
import { HttpException } from "@/exceptions/httpException";
import { Listing, Listings } from "@/interfaces/listing.interface";
import { EntityRepository, In } from "typeorm";

@EntityRepository(ListingEntity)
export class ListingRepository{

  public async listingList(): Promise<Listings>{
    const findListingsAndCount: [ListingEntity[], number] = await ListingEntity.findAndCount({
      relations:["communities", 'user', 'brand', 'category', "media"]
    })
    console.log(findListingsAndCount[0])
    return {
      items: findListingsAndCount[0],
      count: findListingsAndCount[1]
    }
  }

  public async listingAdd(userId:number, listingData: ListingCreateDTO): Promise<Listing>{
    let communities: CommunityEntity[] = [];
    let brand: BrandEntity|null = null;
    let location: LocationEntity|null = null;

    const findUser: UserEntity = await UserEntity.findOne({ where: { id: userId} });
    if (!findUser)  throw new HttpException(409, `User with id ${userId} does not exist`);


    if (listingData.brandId){
      console.log(listingData.brandId)
      const findBrand : BrandEntity = await BrandEntity.findOne({ where: {id: listingData.brandId} })
      console.log(findBrand)
      if (!findBrand) throw new HttpException(409, `Brand with id ${listingData.brandId} does not exist`);
      brand = findBrand;
    }

    if (listingData.locationId){
      console.log(listingData.brandId)
      const findLocation : LocationEntity = await LocationEntity.findOne({ where: {id: listingData.locationId} })
      console.log(findLocation)
      if (!findLocation) throw new HttpException(409, `Brand with id ${listingData.brandId} does not exist`);
      location = findLocation;
    }
    if (listingData.communityIds){
      communities = await CommunityEntity.findByIds(listingData.communityIds)
    }
    let listingMedia = []
    if (listingData.mediaUrls){
      listingData.mediaUrls.forEach(url =>  {
        if (!url.startsWith("http")) throw new HttpException(409, `Invalid media url ${url}`);
        const media_ = ListingMediaEntity.create({url})
        listingMedia.push(media_)
      })
    }
    const findCategory: CategoryEntity = await CategoryEntity.findOne({
      where: {id: listingData.categoryId}
    })
    if (!findCategory) throw new HttpException(409, `Category with id ${listingData.categoryId} does not exist`);

    console.log(listingMedia)
    const createListingData: ListingEntity = await ListingEntity.create({...listingData, category:findCategory, brand, communities, location,  user:findUser, media: listingMedia}).save()
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

  public async listingCommunityAdd(listingId:number, communityIds:number[]): Promise<Listing>{
    const findListing:ListingEntity = await ListingEntity.findOne({
      where: {id: listingId},
      relations: ["communities"]
    })
    const communitiesToAdd:number[] = communityIds.filter(comId => findListing.communities.filter(com=> com.id !== comId))
    // console.log(communitiesToAdd)
    if (!communitiesToAdd) throw new HttpException(409, "No Categories To Add")
    console.log(communitiesToAdd)

    const communitiesEntityToAd: CommunityEntity[] = await CommunityEntity.find({where: {id: In(communitiesToAdd)}});
    // console.log(communitiesEntityToAd)
    console.log(communitiesEntityToAd)
    findListing.communities = [...findListing.communities, ...communitiesEntityToAd]
    const savedListing = await ListingEntity.save(findListing)
    return savedListing
  }

  public async listingCommunityRemove(listingId:number, communityIds:number[]):Promise<Listing>{
    const findListing:ListingEntity = await ListingEntity.findOne({
      where: {id: listingId},
      relations: ["communities"]
    })
    findListing.communities = findListing.communities.filter(com => !communityIds.includes(com.id))
    const savedListing = await ListingEntity.save(findListing)
    return savedListing
  }


  public async listingRemove(listingId: number): Promise<Listing> {
    const findListing: ListingEntity = await ListingEntity.findOne({ where: { id: listingId } });
    if (!findListing) throw new HttpException(409, `Listing with id ${listingId} does not exist`);

    await ListingEntity.delete({ id: listingId });

    return findListing;
  }

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
