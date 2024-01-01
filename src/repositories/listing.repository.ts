import { CategoryArgs, PagingArgs } from '@/dtos/category.dto';
import { ListingCreateDTO, ListingFilterInput, ListingUpdateDTO, SerachInputDTO } from '@/dtos/listing.dto';
import { BrandEntity } from '@/entities/brand.entity';
import { CategoryEntity } from '@/entities/category.entity';
import { CommunityEntity } from '@/entities/community.entity';
import { FavoriteEntity } from '@/entities/favorite.entity';
import { ListingEntity, Status } from '@/entities/listing.entity';
import { ListingMediaEntity } from '@/entities/listingMedia.entity';
import { LocationEntity } from '@/entities/location.entity';
import { SearchEntity } from '@/entities/search.entity';
import { UserEntity } from '@/entities/users.entity';
import { HttpException } from '@/exceptions/httpException';
import { Listing, Listings } from '@/interfaces/listing.interface';
import { Brand } from '@/typedefs/brand.type';
import { EntityRepository, In } from 'typeorm';

const getAllRelatedDependantSubCategories = (categories: any[], categoryId: any) => {
  let categoryIds = [categoryId];

  const getChildrenCategories = (categories:any[], tartgetCategory:number|null) => {
    const children_categories = categories.filter(cat => cat.parentCategory?.id === tartgetCategory);
    console.log("children Categroies", children_categories)
    children_categories.forEach(childrenCat => {
      console.log("now checking for children id, ", childrenCat.id)
      categoryIds.push(childrenCat.id);
      getChildrenCategories(categories, childrenCat);
    });
  };
  getChildrenCategories(categories, categoryId);

  return categoryIds;
};

const get_category_ids_to_filter = async (filters: ListingFilterInput) => {
  let categoryIdsToFilter = [];
  if (filters?.categorySlug || filters?.categoryIds) {
    const categories = await CategoryEntity.find({
      select: ['id', 'slug'],
      relations: ['parentCategory'],
    });
    if (filters?.categorySlug) {
      filters.categorySlug.forEach(slug => {
        const findCategory = categories.find(cat => cat.slug === slug);
        if (!!findCategory) {
          const relatedCategories = getAllRelatedDependantSubCategories(categories, findCategory.id);
          categoryIdsToFilter = categoryIdsToFilter.concat(relatedCategories);
        }
      }) 
    }
    if (!!filters?.categoryIds) {
      console.log('I am here');
      filters?.categoryIds.forEach(categoryId => {
        console.log('catetgoryId', categoryId);
        const relatedCategories = getAllRelatedDependantSubCategories(categories, categoryId);
        console.log('Got related subcategories', relatedCategories);
        categoryIdsToFilter = categoryIdsToFilter.concat(relatedCategories);
      });
    }
  } 
  return categoryIdsToFilter;
}

const get_brand_ids_to_filter = async (filters: ListingFilterInput) => {
  let brandIdsToFilter = []
  if (filters?.brandIds || filters?.brandSlug){
    if (filters?.brandIds){
      brandIdsToFilter = brandIdsToFilter.concat(filters.brandIds)
    }
    else if (filters?.brandSlug){
      const findBrands = await BrandEntity.find({select: ["slug", "id"]})
      const findBrandIds = findBrands.filter(br => filters.brandSlug.split(',').includes(br.slug))
      brandIdsToFilter = brandIdsToFilter.concat(findBrandIds.map(br => br.id))
    }
  }
  return brandIdsToFilter;
}

const get_community_ids_to_filter = async (filters: ListingFilterInput) => {
  let communityIdsToFilter = []
  if (filters?.communityIds || filters?.communitySlug){
    if (filters?.communityIds){
      communityIdsToFilter = communityIdsToFilter.concat(filters.communityIds)
    }
    else if (filters?.communitySlug){
      const findCommunities = await CommunityEntity.find({select: ["slug", "id"]})
      const findCommunityIds = findCommunities.filter(br => filters.communitySlug.split(',').includes(br.slug))
      communityIdsToFilter = communityIdsToFilter.concat(findCommunityIds.map(br => br.id))
    }
  }
  return communityIdsToFilter;
}

@EntityRepository(ListingEntity)
export class ListingRepository {
  public async listingsFavoriteCount(listingIds: any[], userId: number|null){
    console.log("Got User as an argument, ", userId)
    const findFavorites = await FavoriteEntity.find({where: {listingId: In(listingIds)}, select: ["userId", "listingId"]})
    let favorites = Object()
    listingIds.forEach(listing => {
      const listingFavorites = findFavorites.filter(fav => fav.listingId === listing)
      favorites[listing] = Object()
      favorites[listing]["favoriteCount"] = listingFavorites.length;
      favorites[listing]["favoriteStatus"] = userId ? listingFavorites.filter(fav => fav.userId === userId).length > 0 : false;
    })
    return favorites;
  }

  public async listingFavoriteCount(listingId: number, userId: any){
    const findFavorites = await FavoriteEntity.findAndCount({where: {listingId: listingId}})
    return {
      listingId: {
        favoriteCount: findFavorites[1],
        favroriteStatus: userId ? findFavorites[0].filter(fav => fav.userId === userId).length > 0 : false
      }
    }

  }

  public async listingList(userId:any, paging: PagingArgs, filters: ListingFilterInput): Promise<Listings> {
    let categoryIdsToFilter = await get_category_ids_to_filter(filters)
    let brandIdsToFilter = await get_brand_ids_to_filter(filters)
    let communityIdsToFilter = await get_community_ids_to_filter(filters)
    console.log("Community ids to Filter ", communityIdsToFilter)
    // console.log("brandIds to filter", brandIdsToFilter)
    // console.log('CategoryIds to filter', categoryIdsToFilter);
    let sql = ListingEntity.createQueryBuilder('listing')
      .select(['listing.title', 'listing.id', 'listing.price', 'listing.description', 
        'listing.dateCreated', 'listing.meetupLocations', 'listing.quantity', 'listing.dealingMethod', 
        'listing.deliveryCharge', 'listing.slug', "listing.condition", "listing.status"
      ])
      // .leftJoinAndSelect('listing.communities', 'community')
      .leftJoinAndSelect('listing.user', 'user')
      .leftJoinAndSelect('listing.brand', 'brand')
      .leftJoinAndSelect('listing.category', 'category')
      .leftJoinAndSelect('listing.media', 'media')
      // .leftJoinAndSelect('listing.location', 'location')
      .orderBy('listing.id', 'ASC');
    if (paging.starting_after) {
      sql = sql.where('listing.id > :starting_after', { starting_after: paging.starting_after });
    } else if (paging.ending_before) {
      sql = sql.where('listing.id < :ending_before', { ending_before: paging.ending_before });
    }
    
    const limit: number = Math.min(100, paging.limit ? paging.limit : 100);
    sql = sql.limit(limit);

    if (communityIdsToFilter.length > 0) {
      sql = sql.andWhere('community.id IN (:...communityIds)', { communityIds: communityIdsToFilter });
    }
    if (brandIdsToFilter.length > 0) {
      sql = sql.andWhere('brand.id IN (:...brandIds)', { brandIds: brandIdsToFilter });
    }

    if (categoryIdsToFilter.length > 0) {
      sql = sql.andWhere('category.id IN (:...categoryIds)', { categoryIds: categoryIdsToFilter });
    }
    // if (filters?.locationIds) {
    //   sql = sql.andWhere('location.id IN (:...locationIds)', { locationIds: filters?.locationIds });
    // }
    if (filters?.userIds) {
      sql = sql.andWhere('user.id IN (:...userIds)', { userIds: filters?.userIds });
    }
    if (filters?.status){
      sql = sql.andWhere(' listing.status = :status', {status: filters.status})
    }

    const findListings = await sql.getManyAndCount();
    const listingList = findListings[0];
    
    const favorites = await this.listingsFavoriteCount(listingList.map(listing => listing.id), userId)
    const listingWithFavorites = listingList.map(listing => {
      // console.log("listing", listing)
      listing["favoriteCount"] = favorites[listing.id].favoriteCount;
      listing["favoriteStatus"] = favorites[listing.id].favoriteStatus;
      
      return listing
    })
    const count = findListings[1];
    const hasMore = listingList.length === limit;

    return {
      items: listingWithFavorites,
      hasMore,
      count,
    };
  }

  public async listingFind(userId:any, listingArgs: CategoryArgs): Promise<Listing> {
    const findListing: ListingEntity = await ListingEntity.findOne(
                    {
                      where: [
                          {id: listingArgs?.id},
                          // {slug: listingArgs?.slug},
                          {title: listingArgs?.name}],
                      relations: ["user", "brand", "category", "media" ]
                    },
                  );
    if (!findListing) throw new HttpException(409, `Listing not found`);
    const favorites = await FavoriteEntity.findAndCount({where: {"listingId": findListing.id}, select: ["userId", "id"]})

    findListing["favouriteCount"] = favorites[1]
    findListing["favoriteStatus"] = userId ? favorites[0].filter(fav => fav.userId === userId).length > 0 : false
    return findListing;
  }

  public async listingSearch(userId, paging: PagingArgs, filters: ListingFilterInput, query: SerachInputDTO, req ): Promise<Listings>{
    if (!query?.search) return this.listingList(userId, paging, filters);
    let categoryIdsToFilter = await get_category_ids_to_filter(filters);
    console.log('CategoryIds to filter', categoryIdsToFilter);
    // console.log(req.ip, req.ips, "Ip address associated")
    let sql = ListingEntity.createQueryBuilder('listing')
      .select(['listing.title', 'listing.id', 'listing.price', 
      'listing.description', 'listing.dateCreated', 'listing.meetupLocations', 'listing.quantity', 'listing.dealingMethod', 
      'listing.deliveryCharge', 'listing.slug', "listing.condition", "listing.status"])
      // .leftJoinAndSelect('listing.communities', 'community')
      .leftJoinAndSelect('listing.user', 'user')
      .leftJoinAndSelect('listing.brand', 'brand')
      .leftJoinAndSelect('listing.category', 'category')
      .leftJoinAndSelect('listing.media', 'media')
      // .leftJoinAndSelect('listing.location', 'location')
      .orderBy('listing.id', 'ASC');
    if (paging.starting_after) {
      sql = sql.where('listing.id > :starting_after', { starting_after: paging.starting_after });
    }else if (paging.ending_before) {
        sql = sql.where('listing.id < :ending_before', { ending_before: paging.ending_before });
    }
    const limit: number = Math.min(100, paging.limit ? paging.limit : 100);
    sql = sql.limit(limit);

    if (filters?.communityIds) {
      sql = sql.andWhere('community.id IN (:...communityIds)', { communityIds: filters?.communityIds });
    }
    if (filters?.brandIds) {
      sql = sql.andWhere('brand.id IN (:...brandIds)', { brandIds: filters?.brandIds });
    }
    if (categoryIdsToFilter.length > 0) {
      sql = sql.andWhere('category.id IN (:...categoryIds)', { categoryIds: categoryIdsToFilter });
    }
    // if (filters?.locationIds) {
    //   sql = sql.andWhere('location.id IN (:...locationIds)', { locationIds: filters?.locationIds });
    // }
    if (filters?.userIds) {
      sql = sql.andWhere('user.id IN (:...userIds)', { userIds: filters?.userIds });
    }

    sql = sql.andWhere("document_with_weights @@ plainto_tsquery(:query)", {
      query: query.search
    })
    const rawSql = sql.getQuery();
    
    const search = await SearchEntity.create({
      searchQuery: query.search,
      rawSql: rawSql,
      userId: userId,
      clientIp: req.ip
    }).save()


    const findListings = await sql.getManyAndCount();
    const listingList = findListings[0];
    
    const favorites = await this.listingsFavoriteCount(listingList.map(listing => listing.id), userId)
    const listingWithFavorites = listingList.map(listing => {
      // console.log("listing", listing)
      listing["favoriteCount"] = favorites[listing.id].favoriteCount;
      listing["favoriteStatus"] = favorites[listing.id].favoriteStatus;
      return listing
    })

    const count = findListings[1];
    const hasMore = listingList.length === limit;

    return {
      items: listingWithFavorites,
      hasMore,
      count,
    };
  }

  public async listingAdd(userId: number, listingData: ListingCreateDTO): Promise<Listing> {
    let communities: CommunityEntity[] = [];
    let brand: BrandEntity | null = null;
    // let location: LocationEntity | null = null;

    const findUser: UserEntity = await UserEntity.findOne({ where: { id: userId } });
    if (!findUser) throw new HttpException(409, `User with id ${userId} does not exist`);

    if (listingData.brandId) {
      console.log(listingData.brandId);
      const findBrand: BrandEntity = await BrandEntity.findOne({ where: { id: listingData.brandId } });
      console.log(findBrand);
      if (!findBrand) throw new HttpException(409, `Brand with id ${listingData.brandId} does not exist`);
      brand = findBrand;
    }

    
    let listingMedia = [];
    if (listingData.mediaUrls) {
      listingData.mediaUrls.forEach(url => {
        if (!url.startsWith('http')) throw new HttpException(409, `Invalid media url ${url}`);
        const media_ = ListingMediaEntity.create({ url });
        listingMedia.push(media_);
      });
    }
    const findCategory: CategoryEntity = await CategoryEntity.findOne({
      where: { id: listingData.categoryId },
    });
    if (!findCategory) throw new HttpException(409, `Category with id ${listingData.categoryId} does not exist`);

    console.log(listingMedia);
    const createListingData: ListingEntity = await ListingEntity.create({
      ...listingData,
      category: findCategory,
      brand,
      quantity: listingData.quantity ?? 1,
      dealingMethod: listingData.dealingMethod ?? 'meetup',
      meetupLocations: listingData.meetupLocations,
      condition: listingData.condition,
      slug: listingData.slug,
      deliveryCharge: listingData.deliveryCharge ?? 0,
      user: findUser,
      media: listingMedia,
    }).save();
    return createListingData;
  }

  public async listingUpdate(listingId: number, listingData: ListingUpdateDTO): Promise<Listing> {
    let dataToUpdate: any = listingData;

    const findListing: ListingEntity = await ListingEntity.findOne({ where: { id: listingId } });
    if (!findListing) throw new HttpException(409, `Listing with id ${listingId} does not exist`);

    if (listingData.communityIds) {
      const communities = await CommunityEntity.findByIds(listingData.communityIds);
      findListing.communities = communities;
      await findListing.save();

      delete dataToUpdate.communityIds;
    }

    if (listingData.brandId) {
      const findBrand: BrandEntity = await BrandEntity.findOne({ where: { id: listingData.brandId } });
      if (!findBrand) throw new HttpException(409, `Brand with id ${listingData.brandId} does not exist`);
      console.log(findBrand);
      dataToUpdate = { ...dataToUpdate, brand: findBrand };
      delete dataToUpdate.brandId;
    }

    if (listingData.categoryId) {
      const findCategory = await CategoryEntity.findOne({
        where: { id: listingData.categoryId },
      });
      if (!findCategory) throw new HttpException(409, `Category with id ${listingData.categoryId} does not exist`);
      dataToUpdate = { ...dataToUpdate, category: findCategory };

      delete dataToUpdate.categoryId;
    }

    if (listingData.status && Object.values(Status).includes(listingData.status as unknown as Status) ){
      console.log("updating status now")
      dataToUpdate = {...dataToUpdate, status: listingData.status}
    }
    // await findListing.save()
    if (Object.keys(dataToUpdate).length !== 0) await ListingEntity.update({ id: listingId }, dataToUpdate);

    const updatedListing: ListingEntity = await ListingEntity.findOne({
      where: { id: listingId },
      relations: ['communities', 'user', 'brand', 'category'],
    });
    return updatedListing;
  }

  public async listingCommunityAdd(listingId: number, communityIds: number[]): Promise<Listing> {
    const findListing: ListingEntity = await ListingEntity.findOne({
      where: { id: listingId },
      relations: ['communities'],
    });
    const communitiesToAdd: number[] = communityIds.filter(comId => findListing.communities.filter(com => com.id !== comId));
    // console.log(communitiesToAdd)
    if (!communitiesToAdd) throw new HttpException(409, 'No Categories To Add');
    console.log(communitiesToAdd);

    const communitiesEntityToAd: CommunityEntity[] = await CommunityEntity.find({ where: { id: In(communitiesToAdd) } });
    // console.log(communitiesEntityToAd)
    console.log(communitiesEntityToAd);
    findListing.communities = [...findListing.communities, ...communitiesEntityToAd];
    const savedListing = await ListingEntity.save(findListing);
    return savedListing;
  }

  public async listingCommunityRemove(listingId: number, communityIds: number[]): Promise<Listing> {
    const findListing: ListingEntity = await ListingEntity.findOne({
      where: { id: listingId },
      relations: ['communities'],
    });
    findListing.communities = findListing.communities.filter(com => !communityIds.includes(com.id));
    const savedListing = await ListingEntity.save(findListing);
    return savedListing;
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
