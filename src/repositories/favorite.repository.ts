import { FavoriteEntity } from "@/entities/favorite.entity";
import { ListingEntity } from "@/entities/listing.entity";
import { UserEntity } from "@/entities/users.entity";
import { HttpException } from "@/exceptions/httpException";
import { Favorite, FavoritedUsers, FavoriteListings } from "@/interfaces/favorite.interface";
import { EntityRepository } from "typeorm";


@EntityRepository(FavoriteEntity)
export class FavoriteRepository{

  public async favoriteAdd(userId:number, listingId:number): Promise<Favorite>{
    const findUser: UserEntity = await UserEntity.findOne({ where: { id: userId} });
    if (!findUser) throw new HttpException(409, "User doesn't exist");

    const findListing: ListingEntity = await ListingEntity.findOne({ where: { id: listingId } });
    if (!findListing) throw new HttpException(409, `Listing with id ${listingId} doesn't exist`);

    const findFavorite:FavoriteEntity = await FavoriteEntity.findOne({ where: { user: findUser, listing: findListing} });

   
    if (findFavorite) throw new HttpException(409, `Listing already in favorite list`);
   
    const createFavoriteData: Favorite = await FavoriteEntity.create({user: findUser, listing: findListing}).save();
    return createFavoriteData;

  }

  public async favoriteRemove(userId:number, listingId:number): Promise<Favorite>{
    // const findUser: UserEntity = await UserEntity.findOne({ where: { id: userId} });
    // if (!findUser) throw new HttpException(409, "User doesn't exist");

    // const findListing: ListingEntity = await ListingEntity.findOne({ where: { id: listingId } });
    // if (!findListing) throw new HttpException(409, `Listing with id ${listingId} doesn't exist`);

    const findFavorite:FavoriteEntity = await FavoriteEntity.findOne({ where: { userId: userId, listingId: listingId}, relations: ["user", "listing"] });
    if (!findFavorite) throw new HttpException(409, `Favorite Entity not found`);

    const updateFavoriteaData = await findFavorite.softRemove()
    return updateFavoriteaData;
  }

  public async favoriteListingList(userId: number): Promise<FavoriteListings>{

    const favoritesAndCount = await FavoriteEntity.createQueryBuilder("favorite_entity")
                  .select(["favorite_entity.id"])
                  .leftJoinAndSelect('favorite_entity.listing', 'listing')
                  // .select(['listing.title', 'listing.id', 'listing.price', 'listing.description', 'listing.dateCreated'])
                  // .leftJoinAndSelect('listing.communities', 'community')
                  .leftJoinAndSelect('listing.user', 'user')
                  .leftJoinAndSelect('user.profile', 'profile')
                  .leftJoinAndSelect('listing.brand', 'brand')
                  .leftJoinAndSelect('listing.category', 'category')
                  .leftJoinAndSelect('listing.media', 'media')
                  // .leftJoinAndSelect('listing.location', 'location')
                  .where("favorite_entity.userId = :id", { id: userId }).printSql().getManyAndCount()

    const findFavorites:ListingEntity[] = favoritesAndCount[0].map((favorite) => favorite.listing);
    const count: number = favoritesAndCount[1];
    
    const listingWithFavorites = findFavorites.map(listing => {
      listing["favoriteStatus"] = true;
      return listing
    })
    const favorites: FavoriteListings = {
      count: count,
      items: listingWithFavorites
    }
    return favorites;
  }

  public async favoritedUserList(listingId: number): Promise<FavoritedUsers>{

    const favoritesAndCount = await FavoriteEntity.createQueryBuilder("favorite_entity")
                  .select(["favorite_entity.id", "favorite_entity.isDeleted", "favorite_entity.dateCreated"])
                  .leftJoinAndSelect('favorite_entity.user', 'user')
                  .where("favorite_entity.listingId = :id", { id: listingId }).printSql().getManyAndCount()

    const findFavorites:UserEntity[] = favoritesAndCount[0].map((favorite) => favorite.user);
    const count: number = favoritesAndCount[1];

    const favorites: FavoritedUsers = {
      count: count,
      items: findFavorites
    }
    return favorites;
  }

}
