import { Arg, Args, Authorized, Mutation, Query, Resolver } from 'type-graphql';

import { CommunityRepository } from '@/repositories/community.repository';
import { Communities, Community } from '@/typedefs/community.type';
import { CommunityArgs, CommunityCreateDTO, CommunityFilterInput, CommunityUpdateDTO } from '@/dtos/community.dto';

@Resolver()
export class CommunityResolver extends CommunityRepository {

  // @Authorized()
  @Query(() => Communities, {
    description: 'List All Communities',
  })
  async listCommunities(@Arg('filters', { nullable: true }) filters? :CommunityFilterInput): Promise<Communities> {
    const communities: Communities = await this.communityList(filters);
    return communities;
  }

  // @Authorized()
  @Query(() => Community, {
    description: "Get Community by Id, slug or name",
  })
  async getCommunity(@Args(){id, slug, name}: CommunityArgs): Promise<Community> {
    const community: Community = await this.communityFind({id, slug, name});
    return community;
  }

  // @Authorized()
  @Mutation(() => Community, {
    description: 'Create Community',
  })
  async createCommunity(@Arg('communityData') communityData : CommunityCreateDTO): Promise<Community> {
    const community: Community = await this.communityAdd(communityData);
    return community;
  }

  // @Authorized()
  @Query(() => Community, {
    description: 'Find Community by Id',
  })
  async findCommunityById(@Arg('communityId') communityId: number): Promise<Community> {
    const  community: Community = await this.communityFindById(communityId);
    return community;
  }

  // @Authorized()
  @Mutation(() => Community, {
    description: 'Update Community',
  })
  async updateCommunity(@Arg('communityId') communityId: number, @Arg('communityData') communityData: CommunityUpdateDTO): Promise<Community> {
    const community: Community = await this.communityUpdate(communityId, communityData);
    return community;
  }



}
