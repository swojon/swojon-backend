import { IsEmail, IsString, IsNotEmpty, MinLength, MaxLength, isBoolean, IsBoolean, isNumber, IsNumber, isEmpty } from 'class-validator';
import { InputType, Field } from 'type-graphql';
import { Profile } from '@/typedefs/profile.type';


@InputType()
export class UpdateProfileDto implements Partial<Profile> {

  @Field({nullable: true})
  name?:  string;

  @Field({nullable: true})
  phoneNumber?:  string;

  @Field({nullable: true})
  isPhoneNumberVerified?:  boolean;
  //field for isApproved boolean

  @Field({nullable: true})
  address?:  string;

  @Field({nullable: true})
  city?:  string;

  //field for country, state, zipCode string
  @Field({nullable: true})
  state?:  string;

  @Field({nullable: true})
  zipCode?:  string;

  @Field({nullable: true})
  country?:  string;

  @Field({nullable: true})
  facebookHandle?:  string;

  @Field({nullable: true})
  twitterHandle?:  string;

  @Field({nullable: true})
  instagramHandle?:  string;

  @Field({nullable: true})
  linkedinHandle?:  string;

  @Field({nullable: true})
  googleHandle?:  string;

  @Field({nullable: true})
  avatar?:  string;

  @Field({nullable: true})
  avatarThumbnail?:  string;


}
