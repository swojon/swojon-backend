import { SearchEntity } from "@/entities/search.entity";
import { Searches, TrendingSearches } from "@/interfaces/search.interface";
import { SearchQuery } from "@/typedefs/search.type";
import { EntityRepository } from "typeorm";

@EntityRepository(SearchEntity)
export class SearchRepository{
    public async searchHistoryGet(userId ) : Promise<Searches>{
        let searches = await SearchEntity.createQueryBuilder('se')
                .select(['se.id', 'se.title', 'se.isSaved', 'se.removeFromHistory', 'se.searchQuery'])
                .leftJoinAndSelect('se.user', 'user')
                .orderBy('se.id', 'ASC')
                .limit(5)
                .where('se.removeFromHistory = :false')
                .getManyAndCount()
        return {
            items: searches[0],
            count: searches[1],
            hasMore: false
        }
    }

    public async trendingSearchGet(req): Promise<TrendingSearches>{
        let trendingSearches = await SearchEntity.createQueryBuilder('se')
            .select(`se.searchQuery, COUNT(se.searchQuery) as frequency`)
            .groupBy(`se.searchQuery`)
            .orderBy('frequency', 'DESC')
            .limit(10)
            .getRawMany()

        console.log(trendingSearches)
        const searches = trendingSearches.map(se => {
            return {searchQuery : se.searchQuery}
        }) 
        return {
            items: searches,
        }
    }
}