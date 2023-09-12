import { Field, NoExplicitTypeError, ObjectType } from 'type-graphql';
import { User } from './users.type';

@ObjectType()
export class Community {
  @Field()
  id?: number;

  @Field({ nullable: true})
  name?: string;

  @Field({ nullable: true})
  slug?: string;

  @Field({ nullable: true})
  location?: string;

  @Field({ nullable: true})
  latitude?: string;

  @Field({ nullable: true})
  longitude?: string;

  @Field({ nullable: true})
  description?: string;

  @Field()
  isDeleted?: boolean;

  @Field()
  dateCreated?: Date;

  @Field()
  dateUpdated?: Date;

  @Field(() => User)
  createdBy?: User;

  @Field(() => User)
  updatedBy?: User;

  @Field({ nullable: true})
  memberCount?: number;

  @Field(()=>[CommunityMember], { nullable: true})
  members?: CommunityMember[];

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
