import { IsEmail, IsString, IsNotEmpty, MinLength, MaxLength, maxLength } from 'class-validator';
import { InputType, Field } from 'type-graphql';
import { User } from '@typedefs/users.type';

@InputType()
export class CreateUserDto implements Partial<User> {
  @Field()
  @IsEmail()
  email: string;

  @Field()
  @IsString()
  @MinLength(5)
  @MaxLength(30)
  username: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  @MinLength(9)
  @MaxLength(32)
  password: string;
}

@InputType()
export class ResetPasswordDTO {
  @Field()
  password : string;

  @Field()
  token: string;
}

@InputType()
export class UpdateUserDto implements Partial<User> {
  @Field({nullable: true})
  @IsString()
  @IsNotEmpty()
  @MinLength(9)
  @MaxLength(32)
  password?: string;

  @Field({nullable: true})
  @IsString()
  @IsNotEmpty()
  @MinLength(9)
  @MaxLength(32)
  oldPassword?: string;
  
  @Field({nullable: true})
  @IsString()
  @MinLength(5)
  @MaxLength(30)
  username?: string;
}

@InputType()
export class AdminUpdateUserDto implements Partial<User> {

  @Field({nullable: true})
  isBanned?: boolean;

  @Field({nullable: true})
  isLocked?: boolean;

  @Field({nullable: true})
  isSuspended?: boolean;

  @Field({nullable: true})
  role?: string;
  
  //field for isApproved boolean
  @Field({nullable: true})
  isApproved?: boolean;

  //field for isStaff boolean
  @Field({nullable: true})
  isStaff?: boolean;

  //field for isSuperAdmin boolean
  @Field({nullable: true})
  isSuperAdmin?: boolean;

  @Field({nullable: true})
  isVerified?: boolean;

}


