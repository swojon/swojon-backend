import { Field, ObjectType } from 'type-graphql';
import { User } from './users.type';

@ObjectType()
export class Profile {
  @Field()
  id?: number;

  @Field(() => String, { nullable: true })
  name?:  string;
  
  @Field(() => String, { nullable: true })
  phoneNumber?: string ;

  @Field(() => String, { nullable: true })
  isPhoneNumberVerified?: boolean;

  @Field(() => String, { nullable: true })
  address?: string ;

  @Field(() => String, { nullable: true })
  city?: string ;

  @Field(() => String, { nullable: true })
  state?: string ;

  @Field(() => String, { nullable: true })
  zipCode?: string ;

  @Field(() => String, { nullable: true })
  country?: string ;

  @Field(() => String, { nullable: true })
  facebookHandle?: string ;

  @Field(() => String, { nullable: true })
  twitterHandle?: string ;

  @Field(() => String, { nullable: true })
  instagramHandle?: string ;

  @Field(() => String, { nullable: true })
  linkedinHandle?: string ;

  @Field(() => String, { nullable: true })
  googleHandle?: string ;

  @Field(() => String, { nullable: true })
  avatar?: string ;

  @Field(() => String, { nullable: true })
  avatarThumbnail?: string ;
}
