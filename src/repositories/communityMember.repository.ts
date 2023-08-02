import { CommunityMemberCreateDTO, CommunityMemberUpdateDTO, CommunityUpdateDTO } from "@/dtos/community.dto";
import { CommunityEntity } from "@/entities/community.entity";
import { CommunityMemberEntity } from "@/entities/communityMember.entity";
import { UserEntity } from "@/entities/users.entity";
import { HttpException } from "@/exceptions/httpException";
import { MemberCommunityList } from "@/interfaces/community.interface";
import { EntityRepository } from "typeorm";


@EntityRepository(CommunityMemberEntity)
export class CommunityMemberRepository{
    public async usercommunityList(userId: number): Promise<MemberCommunityList>{

        const community = await CommunityMemberEntity.createQueryBuilder("community_member_entity")
                            .select(["community_member_entity.id", "community_member_entity.isDeleted", "community_member_entity.dateJoined",
                              "community_member_entity.communityId"])
                            .leftJoinAndSelect('community_member_entity.community', 'community')
                            .leftJoinAndSelect('community_member_entity.user', 'user')
                            .where("community_member_entity.userId = :id", { id: userId }).printSql().getManyAndCount()

        const community_list: MemberCommunityList = {
            count: community[1],
            items: community[0]
        }

        return community_list;
    }

    public async userAddCommunity(communityData: CommunityMemberCreateDTO): Promise<CommunityMemberEntity> {
        const findCommunity:CommunityEntity = await CommunityEntity.findOne({ where: { id: communityData.communityId } });
        if (!findCommunity) throw new HttpException(409, "Community doesn't exist");

        const findUser: UserEntity = await UserEntity.findOne({ where: { id: communityData.userId } });
        if (!findUser) throw new HttpException(409, "User doesn't exist");

        const findCommunityMember: CommunityMemberEntity = await CommunityMemberEntity.findOne({ where: { user: findUser, community: findCommunity} });
        if (findCommunityMember) throw new HttpException(409, `User is already a member of this community`);

        const createCommunityMemberData: CommunityMemberEntity = await CommunityMemberEntity.create({user:findUser, community:findCommunity}).save();
        return createCommunityMemberData;
    }

    public async userRemoveCommunity(communityData: CommunityMemberCreateDTO): Promise<CommunityMemberEntity> {
      const findCommunity:CommunityEntity = await CommunityEntity.findOne({ where: { id: communityData.communityId } });
      if (!findCommunity) throw new HttpException(409, "Community doesn't exist");

      const findUser: UserEntity = await UserEntity.findOne({ where: { id: communityData.userId } });
      if (!findUser) throw new HttpException(409, "User doesn't exist");

      const findCommunityMember: CommunityMemberEntity = await CommunityMemberEntity.findOne({ where: { user: findUser, community: findCommunity} });
      if (!findCommunityMember) throw new HttpException(409, `User is not a member of this community`);

      findCommunityMember.isDeleted = true;
      const createCommunityMemberData: CommunityMemberEntity = await CommunityMemberEntity.save(findCommunityMember);
      return createCommunityMemberData;
    }

    public async communityMemberUpdate(communityMemberId:number, communityData: CommunityMemberUpdateDTO): Promise<CommunityMemberEntity> {

      const findCommunityMemberEntity: CommunityMemberEntity = await CommunityMemberEntity.findOne({ where: { id: communityMemberId } });
      if (!findCommunityMemberEntity) throw new HttpException(409, "Community Member doesn't exist");


      await CommunityMemberEntity.update(findCommunityMemberEntity, communityData);
      const updateCommunityMember: CommunityMemberEntity = await CommunityMemberEntity.findOne({where: {id: communityMemberId}, relations: ['community', 'user']});

      return updateCommunityMember;

    }


}
