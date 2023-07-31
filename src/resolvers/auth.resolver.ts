import { Authorized, Arg, Ctx, Mutation, Resolver } from 'type-graphql';
import { CreateUserDto } from '@dtos/users.dto';
import { AuthRepository } from '@repositories/auth.repository';
import { User } from '@typedefs/users.type';
// import { TokenData } from '@/interfaces/auth.interface';
import { TokenData, TokenUserData } from '@/typedefs/auth.type';

@Resolver()
export class AuthResolver extends AuthRepository {
  @Mutation(() => User, {
    description: 'User signup',
  })
  async signup(@Arg('userData') userData: CreateUserDto): Promise<User> {
    const user: User = await this.userSignUp(userData);
    return user;
  }

  @Mutation(() => TokenUserData, {
    description: 'User login',
  })
  async login(@Arg('userData') userData: CreateUserDto): Promise<{}> {
    const { tokenData, findUser} = await this.userLogIn(userData);
    return {...findUser, ...tokenData};
  }

  @Authorized()
  @Mutation(() => User, {
    description: 'User logout',
  })
  async logout(@Ctx('user') userData: any): Promise<User> {
    const user = await this.userLogOut(userData.id);
    return user;
  }

}
