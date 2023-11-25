import { SearchEntity } from "@/entities/search.entity";
import { HttpException } from "@/exceptions/httpException";
import { Searches, TrendingSearches } from "@/interfaces/search.interface";
import { EntityRepository, In } from "typeorm";

@EntityRepository(SearchEntity)
export class SearchRepository{
    public async searchHistoryGet(userId ) : Promise<Searches>{
        let searches = await SearchEntity.createQueryBuilder('se')
                .select(['se.id', 'se.title', 'se.isSaved', 'se.removeFromHistory', 'se.searchQuery'])
                .leftJoinAndSelect('se.user', 'user')
                .orderBy('se.id', 'ASC')
                .limit(5)
                .where('se.removeFromHistory =false')
                .where('se.userId = :userId ', {userId: userId})
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

    public async searchHistoryRemove(userId:any): Promise<Searches>{
        if (!userId) throw new HttpException(409, "No userId passed");
        console.log("id", userId)
        const searches = await SearchEntity.find({
            select: ["searchQuery", "id"],
            where: {userId: userId}
        })
        console.log(searches)
        const searchIds = searches.map(se => se.id)
        await SearchEntity.update( {id: In(searchIds)}, {removeFromHistory: true},)
        return {items : searches}

    
    }
}