import { CommunityArgs, CommunityCreateDTO, CommunityFilterInput, CommunityUpdateDTO } from "@/dtos/community.dto";
import { CommunityEntity } from "@/entities/community.entity";
import { CommunityMemberEntity } from "@/entities/communityMember.entity";
import { LocationEntity } from "@/entities/location.entity";

import { UserEntity } from "@/entities/users.entity";
import { HttpException } from "@/exceptions/httpException";
import { Communities } from "@/interfaces/community.interface";

import { Follower } from "@/interfaces/Follower.interface";
import { Community } from "@/typedefs/community.type";
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

    public async communityList(filters: CommunityFilterInput, userId: any): Promise<Communities> {
          let sql = CommunityEntity.createQueryBuilder("ce")
                          .select(["ce.id", "ce.name", "ce.slug", "ce.description",
                                   "ce.banner", "ce.latitude", 'ce.longitude', "ce.isFeatured",

                                  ])
                          .leftJoinAndSelect('ce.members', 'members')
                          .leftJoinAndSelect('members.user', 'user')
                          .leftJoinAndSelect('ce.location', 'location')
                          .orderBy('ce.id', 'ASC')


          if (filters?.userIds && filters?.userIds.length > 0){
            const cmQuery = CommunityMemberEntity
                .createQueryBuilder('cme')
                .select("cme.communityId")
                .where("cme.userId IN (:...userIds)")
                .getSql()
                // .where('br.id In (:...brandIds)', { brandIds })
            sql = sql.where('ce.id In (' + cmQuery + ')', {userIds: filters.userIds})
          }

          const communities = await sql.getManyAndCount()

        // const communities = await CommunityEntity.findAndCount(
        //     {
        //       select: ["id", "name", "slug", "location", "longitude", "latitude",
        //        "description", "banner", "isLive", "isDeleted", "isFeatured", "members"],
        //       relations: ['members', 'members.user', 'location'],
        //     }
        // );
        // console.log(communities[0])

        const communities_list: Communities = {
          count: communities[1],
          items: communities[0].map((community):Community => {
            community["memberCount"] = community.members.length;
            community["memberStatus"] = userId ? community.members.filter((mem) => mem.userId === userId).length > 0 : false;
            return community;
          })

        }

        return communities_list
    }

    public async communityAdd(communityData: CommunityCreateDTO): Promise<CommunityEntity> {
        const findCommunity: CommunityEntity = await CommunityEntity.findOne({ where: [{ name: communityData?.name }, {slug:communityData?.slug}] });
        if (findCommunity) throw new HttpException(409, `Community with name ${communityData.name} already exists`);

        let findLocation:LocationEntity|null = null;
        if (communityData.locationId) findLocation = await LocationEntity.findOne({where: {id: communityData.locationId}})

        const createCommunityData: CommunityEntity = await CommunityEntity.create({...communityData, location: findLocation}).save();
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

        let findLocation:LocationEntity|null = null;
        if (communityData.locationId) {
          findLocation = await LocationEntity.findOne({where: {id: communityData.locationId}})
          delete communityData.locationId;
          communityData["location"] = findLocation
        }


        await CommunityEntity.update(findCommunity, communityData);

        const updateCommunity: CommunityEntity = await CommunityEntity.findOne({ where: { id: communityId } ,  relations: ['members', 'members.user', 'location'] });
        return updateCommunity;


    }
}
