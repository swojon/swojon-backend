import { Field, ObjectType } from 'type-graphql';
import { Profile } from './profile.type';
import { Role } from './role.type';

@ObjectType()
export class ResetStatus {
  @Field({nullable: true})
  success?: boolean;
}
@ObjectType()
export class User {
  @Field()
  id?: number;

  @Field()
  email?: string;

  @Field({nullable: true})
  facebookId?: string;

  @Field({nullable:true})
  username?:string;

  @Field()
  isApproved: boolean;

  @Field()
  isStaff: boolean;

  @Field()
  isEmailVerified: boolean;

  @Field(() => Profile, {nullable: true})
  profile: Profile;

  @Field(() => [Role], {nullable: true})
  roles: Role[];

  
  @Field({nullable:true})
  createdAt?: Date;
}

@ObjectType()
export class UserWithMeta extends User {

  @Field({nullable:true})
  followerCount?: number;

  @Field({nullable: true})
  followingCount?: number;

  @Field({nullable: true})
  followingStatus?: boolean;

  @Field({nullable: true})
  pointBalance?: number;

  @Field({nullable: true})
  listingCount?: number;

}
