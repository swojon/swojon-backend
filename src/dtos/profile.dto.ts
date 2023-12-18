import { IsEmail, IsString, IsNotEmpty, MinLength, MaxLength, isBoolean, IsBoolean, isNumber, IsNumber, isEmpty } from 'class-validator';
import { InputType, Field } from 'type-graphql';
import { Profile } from '@/typedefs/profile.type';


@InputType()
export class UpdateProfileDto implements Partial<Profile> {

  @Field({nullable: true})
  @IsString()
  name?:  string;

  @Field({nullable: true})
  @IsString()
  phoneNumber?:  string;

  @Field({nullable: true})
  @IsBoolean()
  isPhoneNumberVerified?:  boolean;
  //field for isApproved boolean

  @Field({nullable: true})
  @IsString()
  address?:  string;

  @Field({nullable: true})
  @IsString()
  city?:  string;

  //field for country, state, zipCode string
  @Field({nullable: true})
  @IsString()
  state?:  string;

  @Field({nullable: true})
  @IsString()
  zipCode?:  string;

  @Field({nullable: true})
  @IsString()
  country?:  string;

  @Field({nullable: true})
  @IsString()
  facebookHandle?:  string;

  @Field({nullable: true})
  @IsString()
  twitterHandle?:  string;

  @Field({nullable: true})
  @IsString()
  instagramHandle?:  string;

  @Field({nullable: true})
  @IsString()
  linkedinHandle?:  string;

  @Field({nullable: true})
  @IsString()
  googleHandle?:  string;

  @Field({nullable: true})
  @IsString()
  avatar?:  string;

  @Field({nullable: true})
  @IsString()
  avatarThumbnail?:  string;


}
