import { Arg, Authorized, Mutation, Query, Resolver } from 'type-graphql';
import { CreateUserDto, UpdateUserDto } from '@dtos/users.dto';
import { UserRepository } from '@repositories/users.repository';
import { User, UserWithMeta } from '@typedefs/users.type';

@Resolver()
export class UserResolver extends UserRepository {
  // @Authorized()
  @Query(() => [UserWithMeta], {
    description: 'List All Users',
  })
  async listUsers(): Promise<UserWithMeta[]> {
    const users: UserWithMeta[] = await this.userList();
    return users;
  }

  // @Authorized()
  @Query(() => UserWithMeta, {
    description: 'User find by id',
  })
  async getUserById(@Arg('userId') userId: number): Promise<UserWithMeta> {
    const user: UserWithMeta = await this.userFindById(userId);
    return user;
  }

  @Mutation(() => User, {
    description: 'User create',
  })
  async createUser(@Arg('userData') userData: CreateUserDto): Promise<User> {
    const user: User = await this.userCreate(userData);
    return user;
  }

  // @Authorized()
  @Mutation(() => User, {
    description: 'User update',
  })
  async updateUser(@Arg('userId') userId: number, @Arg('userData') userData: UpdateUserDto): Promise<User> {
    const user: User = await this.userUpdate(userId, userData);
    return user;
  }

  //Mutation for userRoleUpdate
  // @Authorized()
  @Mutation(() => User, {
    description: 'User update role',
  })
  async addUserRole(@Arg('userId') userId: number, @Arg('roleId') roleId: number): Promise<User> {
    const user: User = await this.userRoleUpdate(userId, roleId);
    return user;
  }

  @Mutation(() => User, {
    description: 'User remove role',
  })
  async removeUserRole(@Arg('userId') userId: number, @Arg('roleId') roleId: number): Promise<User> {
    const user: User = await this.userRoleRemove(userId, roleId);
    return user;
  }

  // @Authorized()
  @Mutation(() => User, {
    description: 'User delete',
  })
  async deleteUser(@Arg('userId') userId: number): Promise<User> {
    const user: User = await this.userDelete(userId);
    return user;
  }
}
