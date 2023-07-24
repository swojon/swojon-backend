import { ProfileEntity } from "@/entities/profile.entity";
import { UserEntity } from "@/entities/users.entity";
import { EntityRepository } from "typeorm";
import { HttpException } from '@exceptions/httpException';
import { UpdateProfileDto } from "@/dtos/profile.dto";

@EntityRepository(ProfileEntity)
export class ProfileRepository{
  //profile find by id
  public async profileFindById(profileId: number): Promise<ProfileEntity>{
    const findProfile: ProfileEntity = await ProfileEntity.findOne({where: {id: profileId}});
    if(!findProfile)  throw new HttpException(409, "Profile doesn't exist");
    return findProfile;
  }

  //for updating profile
  public async profileUpdate(profileId: number, profileData: UpdateProfileDto): Promise <ProfileEntity>{
    const findProfile: ProfileEntity = await ProfileEntity.findOne({where: {id: profileId}});
    if(!findProfile) throw new HttpException(409, 'profile does not exists');

    await ProfileEntity.update(profileId, profileData);
    const updateProfile: ProfileEntity = await ProfileEntity.findOne({where: {id: profileId}});
    return updateProfile;
  }

  //for creating profile
  public async profileCreate(userId: number , profileData:UpdateProfileDto): Promise<ProfileEntity>{
    //find user by id and update profile
    const findUser: UserEntity = await UserEntity.findOne({where: {id: userId}});
    if(!findUser) throw new HttpException(409, 'user does not exists');
    if (findUser.profile) throw new HttpException(409, 'user already has profile');

    //create profile
    const createProfile: ProfileEntity = await ProfileEntity.create(profileData).save();

    //update user profile
    await UserEntity.update(userId, {profile: createProfile});

    return createProfile;
  }

}
