import { Arg, Args, Authorized, Ctx, Mutation, Query, Resolver } from 'type-graphql';

import { CommunityRepository } from '@/repositories/community.repository';
import { Communities, Community } from '@/typedefs/community.type';
import { CommunityArgs, CommunityCreateDTO, CommunityFilterInput, CommunityUpdateDTO } from '@/dtos/community.dto';
import { MyContext } from '@/interfaces/auth.interface';

@Resolver()
export class CommunityResolver extends CommunityRepository {

  // @Authorized()
  @Query(() => Communities, {
    description: 'List All Communities',
  })
  async listCommunities(@Ctx() ctx:MyContext, @Arg('filters', { nullable: true }) filters? :CommunityFilterInput): Promise<Communities> {
    const userId= ctx.user?.id;  
    const communities: Communities = await this.communityList(filters, userId);
    return communities;
  }

  // @Authorized()
  @Query(() => Community, {
    description: "Get Community by Id, slug or name",
  })
  async getCommunity(@Ctx() ctx:MyContext, @Args(){id, slug, name}: CommunityArgs): Promise<Community> {
    const userId = ctx.user?.id
    const community: Community = await this.communityFind(userId, {id, slug, name});
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
