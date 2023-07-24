import { Resolver, Query, Mutation, Arg, Int } from 'type-graphql';
import { Profile } from '@typedefs/profile.type';
import { ProfileRepository } from '@repositories/profile.repository';
import { UpdateProfileDto } from '@dtos/profile.dto';


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
  async updateProfile(@Arg('profileId') profileId: number, @Arg('profileData') profileData: UpdateProfileDto): Promise<Profile> {
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
