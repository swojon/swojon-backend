import { Community } from "@/typedefs/community.type";
import { Arg, ArgsType, Field, InputType } from "type-graphql";

//TODO : CommunityCreateDTO, CommunityUpdateDTO, UserCommunityDTO
@InputType()
export class CommunityCreateDTO implements Partial<Community> {
  @Field()
  name: string;

  @Field({ nullable: true})
  description?: string;

  @Field()
  slug: string;

  @Field({ nullable: true})
  locationId?: number;

  @Field({ nullable: true})
  latitude?: string;

  @Field({ nullable: true})
  longitude?: string;

  @Field({ nullable: true})
  banner?: string;

  @Field({ nullable: true})
  isLive?: boolean;

  @Field({ nullable: true})
  isFeatured?: boolean;


}

@InputType()
export class CommunityUpdateDTO implements Partial<Community>{
  @Field({ nullable: true})
  name?: string;

  @Field({ nullable: true})
  slug?: string;

  @Field({ nullable: true})
  description?: string;

  @Field({ nullable: true})
  locationId: number;

  @Field({ nullable: true})
  latitude?: string;

  @Field({ nullable: true})
  longitude?: string;

  @Field({ nullable: true})
  banner?: string;

  @Field({ nullable: true})
  isLive?: boolean;

  @Field({ nullable: true})
  isFeatured?: boolean;

  @Field({ nullable: true})
  isApproved?: boolean;

  @Field({ nullable: true})
  isSponsored?: boolean;

  @Field({ nullable: true})
  isVerified?: boolean;

  @Field({ nullable: true})
  isDeleted?: boolean;



}

@ArgsType()
export class CommunityArgs {
  @Field({ nullable: true})
  id?: number;

  @Field({ nullable: true})
  name?: string;

  @Field({ nullable: true})
  slug?: string;
}

export class UserCommunityDTO {

}

@InputType()
export class CommunityMemberCreateDTO {
  @Field()
  userId: number;

  @Field()
  communityId: number;

}

@InputType()
export class CommunityMemberUpdateDTO{
  @Field({ nullable: true})
  role?: string;

  @Field({ nullable: true})
  status?: string;

  @Field({ nullable: true})
  isApproved?: boolean;

  @Field({ nullable: true})
  isBanned?: boolean;

  @Field({ nullable: true})
  isMuted?: boolean;

  @Field({ nullable: true})
  isBlocked?: boolean;

  @Field({ nullable: true})
  isDeleted?: boolean;

  @Field({ nullable: true})
  dateJoined?: Date;

}


@InputType()
export class CommunityFilterInput{
  @Field(() => [Number],{ nullable: true})
  userIds?: number[];

  @Field({nullable:true})
  locationId?: number;

}

// @InputType()
// export class CommunitySortInput{

// }
