import { CommunityMemberCreateDTO, CommunityMemberUpdateDTO } from "@/dtos/community.dto";
import { CommunityMemberRepository } from "@/repositories/communityMember.repository";
import { CommunityMember, MemberCommunityList } from "@/typedefs/community.type";
import { Arg, Mutation, Query, Resolver } from "type-graphql";


@Resolver()
export class CommunityMemberResolver extends CommunityMemberRepository{

  @Query(() => MemberCommunityList, {
    description: "List all communities a user is member of",
  })
  async listUserCommunity(@Arg('userId') userId: number): Promise<MemberCommunityList> {
    const community: MemberCommunityList = await this.usercommunityList(userId);
    return community;
  }

  @Mutation(() => CommunityMember, {
    description: 'Add user to community',
  })
  async addUserToCommunity(@Arg('communityData') communityData: CommunityMemberCreateDTO): Promise<CommunityMember> {
    const community: CommunityMember = await this.userAddCommunity(communityData);
    return community;
  }

  @Mutation(() => CommunityMember, {
    description: 'Remove user from community',
  })
  async removeUserFromCommunity(@Arg('communityData') communityData: CommunityMemberCreateDTO): Promise<CommunityMember> {
    const community: CommunityMember = await this.userRemoveCommunity(communityData);
    return community;
  }


  @Mutation(() => CommunityMember, {
    description: 'Update Community Member',
  })
  async updateCommunityMember(@Arg('communityMemberId') communityMemberId: number, @Arg('communityData') communityData: CommunityMemberUpdateDTO): Promise<CommunityMember> {
    const community: CommunityMember = await this.communityMemberUpdate(communityMemberId, communityData);
    return community;
  }

}
