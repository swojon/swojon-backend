import { Field, ObjectType } from 'type-graphql';
import { Profile } from './profile.type';
import { Role } from './role.type';

@ObjectType()
export class User {
  @Field()
  id?: number;

  @Field()
  email?: string;

  @Field()
  facebookId?: string;

  @Field()
  password: string;

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

}
