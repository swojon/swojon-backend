import { CategoryArgs, CategoryFilterInput, PagingArgs } from "@/dtos/category.dto";
import { ListingCommunityInputDTO, ListingCreateDTO, ListingFilterInput, ListingUpdateDTO, SerachInputDTO } from "@/dtos/listing.dto";
import { MyContext } from "@/interfaces/auth.interface";
import { SearchRepository } from "@/repositories/search.repository";
import { Search, Searches, TrendingSearches } from "@/typedefs/search.type";
import { Args, Ctx, Mutation, Query, Resolver } from "type-graphql";

@Resolver()
export class SearchResolver extends SearchRepository{

  // @Authorized()
  @Query(() => TrendingSearches, {
    description: 'Get Search History',
  })
  async getSearchHistory(@Ctx() ctx:MyContext ): Promise<TrendingSearches> {
    const userId= ctx.user?.id;  
    // const userId = 2;
    const searches: TrendingSearches = await this.searchHistoryGet(userId);
    return searches;
  }

  // @Authorized()
  @Query(() => TrendingSearches, {
    description: "Get trending Searches",
  })
  async getTrendingSearches(@Ctx() ctx:MyContext): Promise<TrendingSearches> {
    const req= ctx.req;
    console.log("req", ctx.user)
    const searches: TrendingSearches = await this.trendingSearchGet(req);
    return searches;
  }
  
  @Mutation(() => Searches,  {
    description: "Remove all search history of a user"
  })
  async removeSearchHistory(@Ctx() ctx:MyContext): Promise<Searches>{
    const userId = ctx.user?.id;
    const searches: Searches = await this.searchHistoryRemove(userId);
    return  searches
  }

}
