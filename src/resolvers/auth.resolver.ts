import { Authorized, Arg, Ctx, Mutation, Resolver, Query } from 'type-graphql';
import { CreateUserDto, ResetPasswordDTO } from '@dtos/users.dto';
import { AuthRepository } from '@repositories/auth.repository';
import { ResetStatus, User } from '@typedefs/users.type';
// import { TokenData } from '@/interfaces/auth.interface';

@Resolver()
export class AuthResolver extends AuthRepository {
  @Mutation(() => User, {
    description: 'User signup',
  })
  async signup(@Arg('userData') userData: CreateUserDto): Promise<User> {
    const user: User = await this.userSignUp(userData);
    return user;
  }

  // @Query(() => TokenUserData, {
  //   description: 'User login',
  // })
  // async login(@Arg('userData') userData: CreateUserDto, @Ctx() ctx: MyContext): Promise<{}> {
  //   const { tokenData, findUser} = await this.userLogIn(userData, ctx);
  //   return {...findUser, ...tokenData};
  // }

  @Authorized()
  @Query(() => User, {
    description: 'User logout',
  })
  async logout(@Ctx('user') userData: any): Promise<User> {
    const user = await this.userLogOut(userData.id);
    return user;
  }
  
  @Query(() => ResetStatus, {
    description: "Check if a username is available or not",
  })
  async checkUsernameAvailability(@Arg('username') username: string): Promise<ResetStatus> {
    const status = await this.UsernameAvailabilityCheck(username)
    return status 
  }

    
  @Query(() => ResetStatus, {
    description: "Check if an email is available or not",
  })
  async checkEmailAvailability(@Arg('email') email: string): Promise<ResetStatus> {
    const status = await this.EmailAvailabilityCheck(email)
    return status 
  }

  @Mutation(() => ResetStatus, {
    description: "Password Reset Request",
  })
  async resetRequest(@Arg('email') email: string): Promise<ResetStatus> {
    const status = await this.passwordResetRequest(email)
    return status 
  }

  @Query(()=> ResetStatus, {
    description: "Check if token valid or not"
  })
  async checkPasswordResetToken(@Arg('token') token:string): Promise<ResetStatus> {
    const status = await this.passwordResetTokenValidity(token);
    return status;
  }

  @Mutation(() => ResetStatus, {
    description: "Password Reset"
  })
  async resetPassword(@Arg('resetData') resetData: ResetPasswordDTO): Promise<ResetStatus> {
    const status: ResetStatus = await this.passwordReset(resetData);
    return status;
  }


}
