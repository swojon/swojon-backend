import { CommunityArgs, CommunityCreateDTO, CommunityUpdateDTO } from "@/dtos/community.dto";
import { CommunityEntity } from "@/entities/community.entity";

import { UserEntity } from "@/entities/users.entity";
import { HttpException } from "@/exceptions/httpException";
import { Communities } from "@/interfaces/community.interface";

import { Follower } from "@/interfaces/Follower.interface";
import { EntityRepository } from "typeorm";


@EntityRepository(CommunityEntity)
export class CommunityRepository{
    // public async usercommunityList(userId: number): Promise<CommunityEntity[]>{
    //     //community a user is member of
    //     const community = await CommunityEntity.createQueryBuilder("community_member_entity")
    //                             .select(["community_member_entity.id", "community_member_entity.name", "community_member_entity.description", "community_member_entity.isDeleted", "community_member_entity.dateCreated", "community_member_entity.dateUpdated"])
    //                             .leftJoinAndSelect('community_member_entity.members', 'members')
    //                             .where("members.id = :id", { id: userId }).printSql().getManyAndCount()
        //                       .select(["community_entity.id", "community_entity.name", "community_entity.description", "community_entity.isDeleted", "community_entity.dateCreated", "community_entity.dateUpdated"])
        //                       .leftJoinAndSelect('community_entity.members', 'members')
        //                       .where("members.id = :id", { id: userId }).printSql().getManyAndCount()


    // }

    public async communityList(): Promise<Communities> {
        const communities = await CommunityEntity.findAndCount(
            {
              select: ["id", "name", "slug", "location", "longitude", "latitude",
               "description", "banner", "isLive", "isApproved", "isFeatured",
                "isSponsored", "isVerified", "members"],
              relations: ['members'],
            }
        );
        // console.log(communities[0])

        const communities_list: Communities = {
          count: communities[1],
          items: communities[0]
        }

        return communities_list
    }

    public async communityAdd(communityData: CommunityCreateDTO): Promise<CommunityEntity> {
        const findCommunity: CommunityEntity = await CommunityEntity.findOne({ where: [{ name: communityData?.name }, {slug:communityData?.slug}] });
        if (findCommunity) throw new HttpException(409, `Community with name ${communityData.name} already exists`);

        const createCommunityData: CommunityEntity = await CommunityEntity.create(communityData).save();

        return createCommunityData;
    }

    public async communityFindById(communityId: number): Promise<CommunityEntity> {

        const findCommunity: CommunityEntity = await CommunityEntity.findOne({ where: { id: communityId } });
        if (!findCommunity) throw new HttpException(409, "Community doesn't exist");

        return findCommunity;
    }

    public async communityFind(communityData: CommunityArgs): Promise<CommunityEntity> {
        const findCommunity: CommunityEntity = await CommunityEntity.findOne({ where: [{ id: communityData?.id }, { name: communityData?.name }, {slug:communityData?.slug}] });
        if (!findCommunity) throw new HttpException(409, "Community Not Found");
        return findCommunity;
    }

    public async communityUpdate(communityId: number, communityData: CommunityUpdateDTO): Promise<CommunityEntity> {
        const findCommunity: CommunityEntity = await CommunityEntity.findOne({ where: { id: communityId } });
        if (!findCommunity) throw new HttpException(409, 'Community does not exists');

        await CommunityEntity.update(findCommunity, communityData);

        const updateCommunity: CommunityEntity = await CommunityEntity.findOne({ where: { id: communityId } });
        return updateCommunity;
    }
}
