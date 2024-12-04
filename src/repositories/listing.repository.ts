import { CategoryArgs, PagingArgs } from '@/dtos/category.dto';
import { AdminListingUpdateDTO, ListingCreateDTO, ListingFilterInput, ListingUpdateDTO, MarkAsUnavailableDTO, SerachInputDTO } from '@/dtos/listing.dto';
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
import {buildPaginator} from 'typeorm-cursor-pagination'
import {Webhook, MessageBuilder} from 'discord-webhook-node'
import { listingApprovalMail, submitListingAndWaitApprovalMail } from '@/mail/sendMail';
import { SitemapLists } from '@/typedefs/listing.type';
const getAllRelatedDependantSubCategories = (categories: any[], categoryId: any) => {
  let categoryIds = [categoryId];

  const getChildrenCategories = (categories:any[], tartgetCategory:number|null) => {
    const children_categories = categories.filter(cat => cat.parentCategory?.id === tartgetCategory);
    // console.log("children Categroies", children_categories)
    children_categories.forEach(childrenCat => {
      // console.log("now checking for children id, ", childrenCat.id)
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
      // console.log('I am here');
      filters?.categoryIds.forEach(categoryId => {
        // console.log('catetgoryId', categoryId);
        const relatedCategories = getAllRelatedDependantSubCategories(categories, categoryId);
        // console.log('Got related subcategories', relatedCategories);
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
    // console.log("Got User as an argument, ", userId)
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

  public async listingSitemapList(): Promise<SitemapLists> {
    const listings = await ListingEntity.find({where: {status: "approved", isDeleted: false}})
    const sitemapListings = listings.map(listing => {
      return {
        url: `${process.env.SITEMAP_BASE_URL}/products/${listing.id}`,
        lastmod: listing.dateCreated,
        changefreq: "daily",
        priority: 0.8
      }
    })

    return {
      items: sitemapListings
    }
  }

  public async listingList(userId:any, paging: PagingArgs, filters: ListingFilterInput): Promise<Listings> {
    let categoryIdsToFilter = await get_category_ids_to_filter(filters)
    let brandIdsToFilter = await get_brand_ids_to_filter(filters)
    // let communityIdsToFilter = await get_community_ids_to_filter(filters)
    // console.log("Community ids to Filter ", communityIdsToFilter)
    // console.log("brandIds to filter", brandIdsToFilter)
    // console.log('CategoryIds to filter', categoryIdsToFilter);
    let sql = ListingEntity.createQueryBuilder('listing')
      .select(['listing.title', 'listing.id', 'listing.price', 'listing.description', 
        'listing.dateCreated', 'listing.meetupLocations', 'listing.quantity', 'listing.dealingMethod', 
        'listing.courierDetails', 'listing.slug', "listing.condition", "listing.status", "listing.isSold", "listing.isAvailable"
      ])
      // .leftJoinAndSelect('listing.communities', 'community')
      .leftJoinAndSelect('listing.user', 'user')
      .leftJoinAndSelect('user.profile', 'profile')
      .leftJoinAndSelect('listing.brand', 'brand')
      .leftJoinAndSelect('listing.category', 'category')
      .leftJoinAndSelect('listing.media', 'media')
      .where("listing.isDeleted = false")
      // .leftJoinAndSelect('listing.location', 'location')
    // let idOrder:"DESC" | "ASC" = "DESC"
    let orderCondition: {
      paginationKeys: any;
      order: "DESC" | "ASC"
    } = {
      paginationKeys : ["id"],
      order: "DESC"
    } //default
    if (paging.orderBy){
      if (paging.orderBy === "highest"){
        sql = sql.orderBy('listing.price', 'DESC')
        orderCondition.paginationKeys = ["price", "id"]
        orderCondition.order = "DESC"
      } 
      else if (paging.orderBy === "lowest") {
        sql = sql.orderBy('listing.price', 'ASC')
        orderCondition.paginationKeys = ["price", "id"]
        orderCondition.order = "ASC"
      }
      if (paging.orderBy === "newest") {
        sql = sql.orderBy('listing.id', 'DESC')
        
      }

    }
    
    
    // if (paging.starting_after) {
    //   sql = sql.where('listing.id > :starting_after', { starting_after: paging.starting_after });
    // } else if (paging.ending_before) {
    //   sql = sql.where('listing.id < :ending_before', { ending_before: paging.ending_before });
    // }
    

    // if (communityIdsToFilter.length > 0) {
    //   sql = sql.andWhere('community.id IN (:...communityIds)', { communityIds: communityIdsToFilter });
    // }
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

    const limit: number = Math.min(100, paging.limit ?? 100);
    // sql = sql.take(limit);\
    const paginator = buildPaginator({
      entity: ListingEntity,
      paginationKeys: orderCondition.paginationKeys,
      alias: 'listing',
      query: {
        limit: limit,
        order: orderCondition.order,
        afterCursor: paging?.starting_after ?  String(paging.starting_after) : null ,
        beforeCursor: paging?.starting_after ? String(paging.ending_before) : null,
      },
    });

    const { data:findListings, cursor } = await paginator.paginate(sql);
    


    // const findListings = await sql.getManyAndCount();
    // const listingList = findListings[0];
    
    const favorites = await this.listingsFavoriteCount(findListings.map(listing => listing.id), userId)
    const listingWithFavorites = findListings.map(listing => {
      // console.log("listing", listing)
      listing["favoriteCount"] = favorites[listing.id].favoriteCount;
      listing["favoriteStatus"] = favorites[listing.id].favoriteStatus;
      
      return listing
    })
    const count = findListings.length;
    const hasMore = findListings.length === limit;
    const beforeCursor = cursor.beforeCursor;
    const afterCursor = cursor.afterCursor;

    return {
      items: listingWithFavorites,
      hasMore,
      count,
      beforeCursor,
      afterCursor

    };
  }

  public async listingFind(userId:any, listingArgs: CategoryArgs): Promise<Listing> {
    const findListing: ListingEntity = await ListingEntity.findOne(
                    {
                      where: [
                          {id: listingArgs?.id, isDeleted: false},
                          // {slug: listingArgs?.slug},
                          {title: listingArgs?.name, isDeleted: false},
                        ],
                      
                      relations: ["user", "user.profile", "brand", "category", "media" ]
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
      'listing.courierDetails', 'listing.slug', "listing.condition", "listing.status", "listing.isSold", "listing.isAvailable"])
      // .leftJoinAndSelect('listing.communities', 'community')
      .leftJoinAndSelect('listing.user', 'user')
      .leftJoinAndSelect('user.profile', 'profile')
      .leftJoinAndSelect('listing.brand', 'brand')
      .leftJoinAndSelect('listing.category', 'category')
      .leftJoinAndSelect('listing.media', 'media')
      // .leftJoinAndSelect('listing.location', 'location')
      .where("listing.isDeleted = false")
      .andWhere("listing.status = :status", {status: "approved"})
      // .orderBy('listing.id', 'ASC');
    
    if (paging.orderBy){
      if (paging.orderBy === "highest")sql = sql.orderBy('listing.price', 'DESC')
      else if (paging.orderBy === "lowest") sql = sql.orderBy('listing.price', 'ASC')
      if (paging.orderBy === "newest") sql = sql.orderBy('listing.id', 'DESC')
    }

    if (paging.starting_after) {
      sql = sql.andWhere('listing.id > :starting_after', { starting_after: paging.starting_after });
    } else if (paging.ending_before) {
        sql = sql.andWhere('listing.id < :ending_before', { ending_before: paging.ending_before });
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
    // let communities: CommunityEntity[] = [];
    let brand: BrandEntity | null = null;
    // let location: LocationEntity | null = null;
    const findUser: UserEntity = await UserEntity.findOne({ where: { id: userId } });
    if (!findUser) throw new HttpException(409, `User with id ${userId} does not exist`);

    if (listingData.brandId) {
      // console.log(listingData.brandId);
      const findBrand: BrandEntity = await BrandEntity.findOne({ where: { id: listingData.brandId } });
      // console.log(findBrand);
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

    // console.log(listingMedia);
    const createListingData: ListingEntity = await ListingEntity.create({
      ...listingData,
      category: findCategory,
      brand,
      quantity: listingData.quantity ?? 1,
      dealingMethod: listingData.dealingMethod ?? 'meetup',
      meetupLocations: listingData.meetupLocations,
      condition: listingData.condition,
      slug: listingData.slug,
      courierDetails: listingData.courierDetails ?? "",
      user: findUser,
      media: listingMedia,
    }).save();
    setTimeout(() => this.notifyListingCreation(createListingData, listingData.mediaUrls), 500);
    setTimeout(() => submitListingAndWaitApprovalMail(findUser, createListingData), 500);
    return createListingData;
  }

  private async notifyListingCreation(listingData: ListingEntity, thumbnails: any[]){
    const webhook_link = process.env.NEW_LISTING_DISCORD_WEBHOOK;
    if (!webhook_link) return 
    const hook = new Webhook(webhook_link);
    const link = `https://www.swojon.com/products/${listingData.id}`;
    const title = listingData.title;
    
    var embed = new MessageBuilder()
      .setTitle(title)
      // @ts-ignore next-line
      .setURL(link)
      .setDescription(`${listingData.description}`)
      .addField("Price", `${listingData.price}`, false)
      .setFooter('Swojon Alert')
      .setTimestamp();
    if (thumbnails[0]){
      embed = embed.setThumbnail(thumbnails[0]);
    }
      try{      
        hook.send(embed)
      } catch(e){}
  }

  public async listingUpdate(listingId: number, listingData: ListingUpdateDTO): Promise<Listing> {

    const findListing: ListingEntity = await ListingEntity.findOne({ where: { id: listingId }, relations: ["media"] });
    if (!findListing) throw new HttpException(409, `Listing with id ${listingId} does not exist`);

    if (!!listingData.brandId) {
      const findBrand: BrandEntity = await BrandEntity.findOne({ where: { id: listingData.brandId } });
      if (!findBrand) throw new HttpException(409, `Brand with id ${listingData.brandId} does not exist`);
      console.log(findBrand);
      // dataToUpdate = { ...dataToUpdate, brand: findBrand };
      findListing.brand = findBrand;
      
    }
   
    if (!!listingData.categoryId) {
      const findCategory = await CategoryEntity.findOne({
        where: { id: listingData.categoryId },
      });
      if (!findCategory) throw new HttpException(409, `Category with id ${listingData.categoryId} does not exist`);
      // dataToUpdate = { ...dataToUpdate, category: findCategory };
      findListing.category = findCategory;
      
    }
    
    if (!!listingData.mediaUrls) {
      let listingMedia = [];
      for await (const url of listingData.mediaUrls) {
        if (!url.startsWith('http')) throw new HttpException(409, `Invalid media url ${url}`);
        var  media_;
        media_ = await ListingMediaEntity.findOne({ where: {url:url} });
        console.log("media", media_)
        if (!media_){
          media_ = await ListingMediaEntity.create({ url });
          console.log("media1", media_)
        }
        listingMedia.push(media_);
       // Closes iterator, triggers return
      }
      // listingData.mediaUrls.forEach(async url => {
      
      // });
      console.log("mul", listingMedia)
      // dataToUpdate = {...dataToUpdate, media: listingMedia}
      findListing.media = listingMedia;
    }
    var should_Status_change = true;

    if (!!listingData.isDeleted || !!listingData.isAvailable || !!listingData.isSold){
      should_Status_change = false;
      if (!!listingData.isDeleted) findListing.isDeleted = listingData.isDeleted;
      if (!!listingData.deleteReason) findListing.deleteReason = listingData.deleteReason;
      if (!!listingData.isAvailable) findListing.isAvailable = listingData.isAvailable;
      if (!!listingData.isSold) findListing.isSold = listingData.isSold;
      if (!!listingData.isSoldHere) findListing.isSoldHere = listingData.isSoldHere;
    }
    if (!!should_Status_change){
      findListing.status = "pending" as unknown as Status;
    }
    // await findList
    if (!!listingData.description) findListing.description = listingData.description
    if (!!listingData.meetupLocations) findListing.meetupLocations = listingData.meetupLocations;
    if (!!listingData.price)  findListing.price = listingData.price;
    if (!!listingData.title) findListing.title = listingData.title;
    if (!!listingData.condition) findListing.condition = listingData.condition;

    
    await ListingEntity.save(findListing)

    // if (Object.keys(dataToUpdate).length !== 0) await ListingEntity.update({id: findListing.id}, dataToUpdate);
    // console.log("data updated")
    const updatedListing: ListingEntity = await ListingEntity.findOne({
      where: { id: listingId },
      relations: ['user', 'brand', 'category', "media"],
    });
    if (!!should_Status_change){
      setTimeout(() => this.notifyListingCreation(updatedListing, listingData.mediaUrls ?? []), 500);
      setTimeout(() => submitListingAndWaitApprovalMail(updatedListing.user, updatedListing), 1000);
    }
    return updatedListing;
  }

  public async listingAvailabilitySet(listingId:number, listingData: MarkAsUnavailableDTO):Promise<Listing>{
    
    const findListing: ListingEntity = await ListingEntity.findOne({ where: { id: listingId }, relations: ["media"] });
    if (!findListing) throw new HttpException(409, `Listing with id ${listingId} does not exist`);
    findListing.isAvailable = listingData.isAvailable;
    if (!!listingData.isRelist){
      findListing.datePublished = new Date();
    }
       
    await ListingEntity.save(findListing);
    // if (Object.keys(dataToUpdate).length !== 0) await ListingEntity.update({id: findListing.id}, dataToUpdate);
    // console.log("data updated")
    const updatedListing: ListingEntity = await ListingEntity.findOne({
      where: { id: listingId },
      relations: ['user', 'brand', 'category', "media"],
    });
    return updatedListing;

  }
  public async adminListingUpdate(listingId: number, adminListingData: AdminListingUpdateDTO ): Promise<Listing>{

    const findListing: ListingEntity = await ListingEntity.findOne({ where: { id: listingId }, relations: ["media", "user"] });
    if (!findListing) throw new HttpException(409, `Listing with id ${listingId} does not exist`);

    if (!!adminListingData.rejectReason)  findListing.rejectReason = adminListingData.rejectReason;
    if (!!adminListingData.isAvailable) findListing.isAvailable = adminListingData.isAvailable;
    if (!!adminListingData.status && Object.values(Status).includes(adminListingData.status as unknown as Status) ){
      // dataToUpdate = {...dataToUpdate, status: listingData.status}
      findListing.status = adminListingData.status as unknown as Status;
      
      if (findListing.status == "approved"){
        findListing.datePublished = new Date();
        setTimeout(() => listingApprovalMail(findListing.user, findListing), 1000);
      }
    }
    if (!!adminListingData.isDeleted) findListing.isDeleted = adminListingData.isDeleted;
    if (!!adminListingData.deleteReason) findListing.deleteReason = adminListingData.deleteReason;
     
    await ListingEntity.save(findListing);

    // if (Object.keys(dataToUpdate).length !== 0) await ListingEntity.update({id: findListing.id}, dataToUpdate);
    // console.log("data updated")
    const updatedListing: ListingEntity = await ListingEntity.findOne({
      where: { id: listingId },
      relations: ['user', 'brand', 'category', "media"],
    });
    return updatedListing;
  }

  public async listingRemove(listingId: number): Promise<Listing> {
    const findListing: ListingEntity = await ListingEntity.findOne({ where: { id: listingId } });
    if (!findListing) throw new HttpException(409, `Listing with id ${listingId} does not exist`);
    
    await findListing.softRemove();
    return findListing;
  }

}
