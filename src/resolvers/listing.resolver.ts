import { CategoryArgs, CategoryFilterInput, PagingArgs } from "@/dtos/category.dto";
import { AdminListingUpdateDTO, ListingCommunityInputDTO, ListingCreateDTO, ListingFilterInput, ListingUpdateDTO, MarkAsUnavailableDTO, SerachInputDTO } from "@/dtos/listing.dto";
import { MyContext } from "@/interfaces/auth.interface";
import { ListingRepository } from "@/repositories/listing.repository";
import { Listing, Listings, SitemapLists } from "@/typedefs/listing.type";
import { Arg, Args, Authorized, Ctx, Mutation, Query, Resolver } from "type-graphql";

@Resolver()
export class ListingResolver extends ListingRepository{

  // @Authorized()
  @Query(() => Listings, {
    description: 'List All Listings',
  })
  async listListings(@Ctx() ctx:MyContext, @Args() paging: PagingArgs, @Arg('filters', {nullable:true}) filters?: ListingFilterInput): Promise<Listings> {
    const userId= ctx.user?.id;  
    const listings: Listings = await this.listingList(userId, paging, filters);
    return listings;
  }

  @Query(() => SitemapLists, {
    description: "Get User by Id",
  })
  async generateListingsSitemap(): Promise<SitemapLists> {
    const sitemaps: SitemapLists = await this.listingSitemapList();
    return sitemaps;
  }

  // @Authorized()
  @Query(() => Listing, {
    description: "Get Category by Id, slug or name",
  })
  async getListing(@Ctx() ctx:MyContext ,@Args(){id, slug, name}: CategoryArgs): Promise<Listing> {
    const userId = ctx.user?.id
    const category: Listing = await this.listingFind(userId, {id, slug, name});
    return category;
  }

  @Query(() => Listings, {
    description: "Search for listings",
  })
  async searchListings(@Ctx() ctx: MyContext, @Arg("query") query: SerachInputDTO,  @Args() paging: PagingArgs, @Arg('filters', {nullable:true}, ) filters?: ListingFilterInput): Promise<Listings> {
    const userId = ctx.user?.id;
    const req = ctx.req;
    const listings: Listings = await this.listingSearch(userId, paging, filters, query, req);
    return listings
  }

  // @Authorized()
  @Mutation(() => Listing, {
    description: 'Create Listing',
  })
  async createListing(@Arg('listingData') listingData : ListingCreateDTO,  @Ctx() ctx:MyContext): Promise<Listing> {
    console.log("context", ctx)
    const userId: number = ctx.user.id;
    // const userId: number = 5; //it is temporary
    const listing: Listing = await this.listingAdd(userId, listingData);
    
    return listing;
  }

  @Mutation(() => Listing, {
    description: 'Remove Listing',
  })
  async removeListing(@Arg('listingId') listingId: number): Promise<Listing> {
    const listing: Listing = await this.listingRemove(listingId);
    return listing;
  }

  // @Authorized()
  @Mutation(() => Listing, {
    description: 'Update Listing',
  })
  async updateListing(@Arg('listingId') listingId: number, @Arg('listingData') listingData: ListingUpdateDTO): Promise<Listing> {
    const listing: Listing = await this.listingUpdate(listingId, listingData);
    return listing;
  }

  @Mutation(()=> Listing, {
    description: "Only Admin will be able to update those information"
  })
  async updateListingAdmin(@Arg('listingId') listingId: number, @Arg('adminlistingData') adminListingData: AdminListingUpdateDTO) : Promise <Listing> {
    const listing: Listing = await this.adminListingUpdate(listingId, adminListingData);
    return listing
  }

  
  @Mutation(()=> Listing, {
    description: "Admin update listing"
  })
  async setListingAvailability(@Arg('listingId') listingId: number, @Arg('listingData') listingData: MarkAsUnavailableDTO) : Promise <Listing> {
    const listing: Listing = await this.listingAvailabilitySet(listingId, listingData);
    return listing
  }
  
}
