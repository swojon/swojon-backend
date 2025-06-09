import { brandCacheKey as collectionCacheKey } from "@/constants";
import { BrandCreateDTO } from "@/dtos/brand.dto";
import { PagingArgs } from "@/dtos/category.dto";
import { CollectionArgs, CollectionCreateDTO, CollectionListingInput, CollectionUpdateDTO, ListingCollectionInput } from "@/dtos/collection.dto";
import { MyContext } from "@/interfaces/auth.interface";
import { isModerator } from "@/permission";
import { CollectionRepository } from "@/repositories/collections.repository";
import { Brand } from "@/typedefs/brand.type";
import { Collection, Collections } from "@/typedefs/collections.type";
import { Listing } from "@/typedefs/listing.type";
import { invalidateCache } from "@/utils/cacheUtility";
import { Arg, Args, Ctx, Mutation, Query, Resolver } from "type-graphql";

@Resolver()
export class CollectionResolver extends CollectionRepository{
    @Query(()=> Collections, {
        description: "List All Collections"
    })
    async listCollections(@Args() paging: PagingArgs): Promise<Collections>{
        const collections = await this.collectionList();
        return collections
    }

  // @Authorized()
  @Mutation(() => Collection, {
    description: 'Create Collection',
  })
  async createCollection(@Arg('collectionData') collectionData : CollectionCreateDTO, @Ctx() ctx: MyContext): Promise<Collection> {
    if (!isModerator(ctx.user)) {
      throw new Error("You don't have permission to access this resource");
    }
    await invalidateCache(`${collectionCacheKey}*`)

    const collection: Collection = await this.collectionAdd(collectionData);
    return collection;
  }

  // @Authorized()
  @Mutation(() => Collection, {
    description: 'Remove Collection',
  })
  async removeCollection(@Arg('collectionId') collectionId: number, @Ctx() ctx: MyContext): Promise<Collection> {
    //moderator can remove brand
    if (!isModerator(ctx.user)) {
      throw new Error("You don't have permission to access this resource");
    }
    const collection: Collection = await this.collectionRemove(collectionId);
    await invalidateCache(`${collectionCacheKey}*`)
    return collection;
  }

  // @Authorized()
  @Mutation(() => Collection, {
    description: 'Update Collection',
  })
  async updateCollection(@Arg('collectionId') collectionId: number, @Arg('collectionData') collectionData: CollectionUpdateDTO, @Ctx() ctx: MyContext): Promise<Collection> {
    // moderator can update brand
    if (!isModerator(ctx.user)) {
      throw new Error("You don't have permission to access this resource");
    }
    const collection: Collection = await this.collectionUpdate(collectionId, collectionData);
    await invalidateCache(`${collectionCacheKey}*`)
    return collection;
  }
  
  
  @Mutation(()=>Listing, {
    description: "Add collection to listing"
  })
  async addListingCollection(@Arg('inputData') inputData: ListingCollectionInput, @Ctx() ctx: MyContext): Promise<Listing>{
    //moderator can add category to brand
    if (!isModerator(ctx.user)) {
      throw new Error("You don't have permission to access this resource");
    }
    const collection:Listing = await this.ListingCollectionAdd(inputData.listingId, inputData.collectionIds)
    await invalidateCache(`${collectionCacheKey}*`)
    return collection
  }

  @Query(() => Collection, {
    description: "Get Collection by Id, slug or name",
  })
  async getCollection(@Args(){id, slug, name}: CollectionArgs): Promise<Collection> {
    const colleciton: Collection = await this.collectionFind({id, slug, name});
    return colleciton;
  }
  
  @Mutation(()=>Listing, {
    description: "Remove collection to listing"
  })
  async removeListingCollection(@Arg('inputData') inputData: ListingCollectionInput, @Ctx() ctx: MyContext): Promise<Listing>{
    //moderator can add category to brand
    if (!isModerator(ctx.user)) {
      throw new Error("You don't have permission to access this resource");
    }
    const collection:Listing = await this.listingCollectionRemove(inputData.listingId, inputData.collectionIds)
    await invalidateCache(`${collectionCacheKey}*`)
    return collection
  }

  @Mutation(()=>Collection, {
    description: "Add category of brand"
  })
  async addCollectionListing(@Arg('inputData') inputData: CollectionListingInput, @Ctx() ctx: MyContext): Promise<Collection>{
    //moderator can add category to brand
    if (!isModerator(ctx.user)) {
      throw new Error("You don't have permission to access this resource");
    }
    const collection:Collection = await this.collectionListingAdd(inputData.collectionId, inputData.listingIds)
    await invalidateCache(`${collectionCacheKey}*`)
    return collection
  }

  
  // @Authorized()
  @Mutation(()=>Collection, {
    description: "Remove category of brand"
  })
  async removeCollectionListing(@Arg('inputData') inputData: CollectionListingInput, @Ctx() ctx: MyContext) : Promise<Collection>{
    // moderator can remove category from brand
    if (!isModerator(ctx.user)) {
      throw new Error("You don't have permission to access this resource");
    }
    const collection: Collection = await this.collectionListingRemove(inputData.collectionId, inputData.listingIds)
    await invalidateCache(`${collectionCacheKey}*`)
    return collection
  }



}