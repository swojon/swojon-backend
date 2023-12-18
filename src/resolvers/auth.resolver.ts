import { Authorized, Arg, Ctx, Mutation, Resolver, Query } from 'type-graphql';
import { CreateUserDto } from '@dtos/users.dto';
import { AuthRepository } from '@repositories/auth.repository';
import { User } from '@typedefs/users.type';
// import { TokenData } from '@/interfaces/auth.interface';
import { TokenData, TokenUserData } from '@/typedefs/auth.type';
import { MyContext } from '@/interfaces/auth.interface';

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

}
