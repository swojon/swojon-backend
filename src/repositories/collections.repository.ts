import { CollectionCreateDTO, CollectionUpdateDTO } from "@/dtos/collection.dto";
import { CollectionEntity } from "@/entities/collection.entity";
import { ListingEntity } from "@/entities/listing.entity";
import { HttpException } from "@/exceptions/httpException";
import { Brand } from "@/typedefs/brand.type";
import { Collection, Collections } from "@/typedefs/collections.type";
import { Listing } from "@/typedefs/listing.type";
import { In } from "typeorm";

export class CollectionRepository {
    public async ListingCollectionAdd(listingId:number, collectionIds:number[]): Promise<Listing>{
        const findListing:ListingEntity = await ListingEntity.createQueryBuilder('listing')
                                .select(['listing.title', 'listing.id', 'listing.price', 'listing.description', 
        'listing.dateCreated', 'listing.meetupLocations', 'listing.quantity', 'listing.dealingMethod', 
        'listing.courierDetails', 'listing.slug', "listing.condition", "listing.status", "listing.isSold", "listing.isAvailable"])
                                .leftJoinAndSelect('listing.user', 'user')
                                .leftJoinAndSelect('user.profile', 'profile')
                                .leftJoinAndSelect('listing.brand', 'brand')
                                .leftJoinAndSelect('listing.category', 'category')
                                .leftJoinAndSelect('listing.media', 'media')
                                .leftJoinAndSelect('listing.collections', "collections")
                                .where("listing.id = :id", { id: listingId })
                                .getOne()
        const CollectionIdToAdd:number[] = collectionIds.filter(catId => findListing.collections.filter(cat=> cat.id !== catId))
        // console.log(CategoriesIdToAdd)
        if (!CollectionIdToAdd) throw new HttpException(409, "No Categories To Add")
        console.log(CollectionIdToAdd)
    
        const CollectionsToAdd: CollectionEntity[] = await CollectionEntity.find({where: {id: In(CollectionIdToAdd)}});
        // console.log(CategoriesToAdd)
        console.log(CollectionsToAdd)
        findListing.collections = [...findListing.collections, ...CollectionsToAdd]
        const SavedListing = await ListingEntity.save(findListing)
    
        return SavedListing
      }
    
      public async listingCollectionRemove(listingId: number, collectionIds:number[]):Promise<Listing>{
        const findListing:ListingEntity = await ListingEntity.createQueryBuilder('listing')
        .select(['listing.title', 'listing.id', 'listing.price', 'listing.description', 
          'listing.dateCreated', 'listing.meetupLocations', 'listing.quantity', 'listing.dealingMethod', 
          'listing.courierDetails', 'listing.slug', "listing.condition", "listing.status", "listing.isSold", "listing.isAvailable"])
        .leftJoinAndSelect('listing.user', 'user')
        .leftJoinAndSelect('user.profile', 'profile')
        .leftJoinAndSelect('listing.brand', 'brand')
        .leftJoinAndSelect('listing.category', 'category')
        .leftJoinAndSelect('listing.media', 'media')
        .leftJoinAndSelect('listing.collections', "collections")
        .where("listing.id = :id", { id: listingId })
        .getOne()
    
        findListing.collections = findListing.collections.filter(cat => !collectionIds.includes(cat.id))
        const SavedListing = await ListingEntity.save(findListing)
        return SavedListing
      }

      public async collectionListingAdd(collectionId:number, listingIds:number[]): Promise<Collection>{
        const findCollection:CollectionEntity = await CollectionEntity.createQueryBuilder('cl')
                                .select(["cl.id", "cl.name", "cl.slug", "cl.description",
                                         "cl.isFeatured", "cl.isDeleted"])
                                .leftJoinAndSelect('cl.listings', 'listings')
                                .where("cl.id = :id", { id: collectionId })
                                .getOne()
        const ListingIdToAdd:number[] = listingIds.filter(catId => findCollection.listings.filter(cat=> cat.id !== catId))
        // console.log(CategoriesIdToAdd)
        if (!ListingIdToAdd) throw new HttpException(409, "No Listign Ids To Add")
        console.log(ListingIdToAdd)
    
        const ListingsToAdd: ListingEntity[] = await ListingEntity.find({where: {id: In(ListingIdToAdd)}});
        // console.log(CategoriesToAdd)
        console.log(ListingsToAdd)
        findCollection.listings = [...findCollection.listings, ...ListingsToAdd]
        const SavedCollection = await CollectionEntity.save(findCollection)
    
        return SavedCollection
      }

    public async collectionListingRemove(collectionId: number, listingIds:number[]):Promise<Collection>{
        const findCollection:CollectionEntity = await CollectionEntity.createQueryBuilder('cl')
        .select(["cl.id", "cl.name", "cl.slug", "cl.description", "cl.isFeatured", "cl.isDeleted"])
        .leftJoinAndSelect('cl.listings', 'listings')
        .where("cl.id = :id", { id: collectionId })
        .getOne()
    
        findCollection.listings = findCollection.listings.filter(cat => !listingIds.includes(cat.id))
        const SavedListing = await CollectionEntity.save(findCollection)
        return SavedListing
    }

    public async collectionAdd(collectionData:CollectionCreateDTO):Promise<Collection>{
        // console.log("Collection data", collectionData)
        const findCollection:CollectionEntity = await CollectionEntity.findOne({
            where: [{name: collectionData.name}, {slug: collectionData.slug}]
        })
        if (findCollection) throw new HttpException(409, `Collection with ${collectionData.name} already exist`)

        const createCollectionData: CollectionEntity = await CollectionEntity.create(collectionData).save()
        return createCollectionData
    }

    
  public async collectionUpdate(collectionId:number, collectionData: CollectionUpdateDTO): Promise<Collection>{
    const findCollection:CollectionEntity = await CollectionEntity.findOne({
      where: {id: collectionId}
    })

    if (!findCollection) throw new HttpException(409, `Collection with id ${collectionId} does not exist`);
    let dataToUpdate: any = collectionData;
    Object.keys(dataToUpdate).forEach(key => {
      if (!dataToUpdate[key] ) {
        delete dataToUpdate[key];
      }
    });
    
    await CollectionEntity.update({ id: collectionId }, dataToUpdate);

    // const updatedBrand: CategoryEntity = await CategoryEntity.findOne({ where: { id: brandId }, relations: ['categories'] });
    const updatedCollection: CollectionEntity = await CollectionEntity.createQueryBuilder('cl')
                              .select(["cl.id", "cl.name", "cl.slug", "cl.description",
                                      "cl.isFeatured", "cl.isDeleted", "cl.banner"])
                              .leftJoinAndSelect('cl.listings', 'listings')
                              .where("cl.id = :id", { id: collectionId })
                              .getOne()
    return updatedCollection;

  }

  
  public async collectionRemove(collectionId: number): Promise<Collection> {
    const findCollection: CollectionEntity = await CollectionEntity.createQueryBuilder('cl')
                              .select(["cl.id", "cl.name", "cl.slug", "cl.description",
                                      "cl.isFeatured", "cl.isDeleted"])
                              .leftJoinAndSelect('cl.listings', 'listings')
                              .where("cl.id = :id", { id: collectionId })
                              .getOne()

    if (!findCollection) throw new HttpException(409, `Colleciton with id ${collectionId} does not exist`);

    // await CategoryEntity.delete({ id: brandId });
    await CollectionEntity.softRemove(findCollection)

    return findCollection;
  }

    public async collectionList():Promise<Collections>{
        const findCollections = await CollectionEntity.createQueryBuilder('cl')
        .select(["cl.id", "cl.name", "cl.slug", "cl.description", "cl.isFeatured", "cl.isDeleted", "cl.banner"])
        .leftJoinAndSelect('cl.listings', 'listings')
        .getManyAndCount()
        return {
            items: findCollections[0],
            count: findCollections[1]
        }
    }

    public async collectionDetails(collectionId):Promise<Collection>{
        const findCollection:CollectionEntity = await CollectionEntity.createQueryBuilder('cl')
        .select(["cl.id", "cl.name", "cl.slug", "cl.description", "cl.isFeatured", "cl.isDeleted", "cl.banner"])
        .leftJoinAndSelect('cl.listings', 'listings')
        .leftJoinAndSelect('listings.user', 'user')
        .leftJoinAndSelect('user.profile', 'profile')
        .leftJoinAndSelect('listings.brand', 'brand')
        .leftJoinAndSelect('listings.category', 'category')
        .leftJoinAndSelect('listings.media', 'media')
        .where("cl.id = :id", { id: collectionId })
        .getOne()

        return findCollection;
    }
}