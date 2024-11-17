import { Resolver, Query, Mutation, Arg, Int, Ctx } from 'type-graphql';
import { Profile } from '@typedefs/profile.type';
import { ProfileRepository } from '@repositories/profile.repository';
import { UpdateProfileDto } from '@dtos/profile.dto';
import { isStaffOrSelf } from '@/permission';
import { MyContext } from '@/interfaces/auth.interface';


@Resolver()
export class ProfileResolver extends ProfileRepository {
  @Query(() => Profile, {
    description: 'Profile find by id',
  })
  async getProfileById(@Arg('profileId') profileId: number): Promise<Profile> {
    const profile: Profile = await this.profileFindById(profileId);
    return profile;
  }

  @Mutation(() => Profile, {
    description: 'Profiile update',
  })
  async updateProfile(@Arg('profileId') profileId: number, @Arg('profileData') profileData: UpdateProfileDto, @Ctx() ctx:MyContext): Promise<Profile> {
    if (!isStaffOrSelf(ctx.user, profileId)) {
      throw new Error("You don't have permission to access this resource");
    }
    const profile: Profile = await this.profileUpdate(profileId, profileData );
    return profile;
  }

  //create profile for userId
  @Mutation(() => Profile, {
    description: "Profile create"
  })
  async createProfile(@Arg('userId') userId: number, @Arg('profileData') profileData: UpdateProfileDto): Promise<Profile>{
    const profile: Profile = await this.profileCreate(userId, profileData);
    return profile
  }

}
