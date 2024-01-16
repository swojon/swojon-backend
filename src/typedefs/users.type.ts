import { Field, ObjectType } from 'type-graphql';
import { Profile } from './profile.type';
import { Role } from './role.type';


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
export class UserWithMeta {
  @Field()
  id?: number;

  @Field()
  email?: string;

  @Field({nullable: true })
  facebookId?: string;

  @Field({nullable:true})
  username?:string;

  @Field()
  isApproved: boolean;

  @Field()
  isStaff: boolean;

  @Field()
  isEmailVerified: boolean;

  @Field()
  createdAt?: Date;

  @Field(() => Profile, {nullable: true})
  profile: Profile;

  @Field(() => [Role], {nullable: true})
  roles: Role[];

  @Field({nullable:true})
  followerCount?: number;

  @Field({nullable: true})
  followingCount?: number;

  @Field({nullable: true})
  pointBalance?: number;

  @Field({nullable: true})
  listingCount?: number;

}
