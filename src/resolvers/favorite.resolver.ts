import { Arg, Authorized, Mutation, Query, Resolver } from 'type-graphql';

import { FollowRepository } from '@/repositories/follow.repository';
import { Follow, Followers } from '@/typedefs/follow.type';
import { FavoriteRepository } from '@/repositories/favorite.repository';
import { Favorite, FavoriteListings, FavoritedUsers } from '@/typedefs/favorite.type';

@Resolver()
export class FavoriteResolver extends FavoriteRepository {
  // @Authorized()
  @Query(() => FavoriteListings, {
    description: 'List All Favorited Listing of User',
  })
  async listFavoriteListing(@Arg('userId') userId: number): Promise<FavoriteListings> {
    const favorite: FavoriteListings = await this.favoriteListingList(userId);
    return favorite;

  }

  @Query(() => FavoritedUsers, {
    description: 'List All Favorited Listing of User',
  })
  async listFavoritedUser(@Arg('listingId') listingId: number): Promise<FavoritedUsers> {
    const favorite: FavoritedUsers = await this.favoritedUserList(listingId);
    return favorite
  }

  // @Authorized()
  @Mutation(() => Favorite, {
    description: 'Add Favorite to Listing',
  })
  async addFavorite(@Arg('userId') userId: number, @Arg('listingId') listingId: number): Promise<Favorite> {
    const follow: Favorite = await this.favoriteAdd(userId, listingId);
    return follow;
  }

  // @Authorized()
  @Mutation(() => Favorite, {
    description: 'Remove Favorite From Listing',
  })
  async removeFavorite(@Arg('userId') userId: number, @Arg('listingId') listingId: number): Promise<Favorite> {
    const follow: Favorite = await this.favoriteRemove(userId, listingId);
    return follow;
  }

}
