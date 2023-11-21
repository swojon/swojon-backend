import { Field, NoExplicitTypeError, ObjectType } from 'type-graphql';
import { User } from './users.type';
import { Location } from './location.type';

@ObjectType()
export class Community {
  @Field()
  id?: number;

  @Field({ nullable: true})
  name?: string;

  @Field({ nullable: true})
  slug?: string;

  @Field(() => Location, { nullable: true})
  location?: Location;

  @Field({ nullable: true})
  latitude?: string;

  @Field({ nullable: true})
  longitude?: string;

  @Field({ nullable: true})
  description?: string;

  @Field()
  isDeleted?: boolean;

  @Field()
  isFeatured?: boolean;

  @Field({nullable:true})
  banner?: string;

  @Field({ nullable: true})
  memberCount?: number;

  @Field(()=>[CommunityMember], { nullable: true})
  members?: CommunityMember[];

  @Field({nullable: true})
  memberStatus?: boolean;

}

@ObjectType()
export class Communities {
  @Field(()=>[Community])
  items?: Community[];

  @Field({ nullable: true})
  count?: number;
}

@ObjectType()
export class CommunityMember {
  @Field()
  id?: number;

  @Field()
  community?: Community;

  @Field(() => User)
  user?: User;

  @Field()
  isDeleted?: boolean;

  @Field({ nullable: true})
  dateJoined?: Date;

  @Field({ nullable: true})
  role?: string;

}

@ObjectType()
export class CommunityMembers {
  @Field(()=>[CommunityMember])
  members?: CommunityMember[];

  @Field({ nullable: true})
  count?: number;
}


@ObjectType()
export class MemberCommunityList {
  @Field(()=>[CommunityMember])
  items?: CommunityMember[];

  @Field({ nullable: true})
  count?: number;
}
