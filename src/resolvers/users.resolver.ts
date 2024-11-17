import { Arg, Authorized, Ctx, Mutation, Query, Resolver } from 'type-graphql';
import { AdminUpdateUserDto, CreateUserDto, UpdateUserDto } from '@dtos/users.dto';
import { UserRepository } from '@repositories/users.repository';
import { User, UserWithMeta } from '@typedefs/users.type';
import { MyContext } from '@/interfaces/auth.interface';
import { SitemapLists } from '@/typedefs/listing.type';
import { isStaff } from '@/permission';

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

  @Query(() => SitemapLists, {
    description: "Get all sellers sitemap",
  })
  async generateSellersSitemap(): Promise<SitemapLists> {
    const sitemaps: SitemapLists = await this.sellerSitemapList();
    return sitemaps;
  }


  // @Authorized()
  @Query(() => UserWithMeta, {
    description: 'User find by id',
  })
  async getUserByIdOrUsername(@Ctx() ctx:MyContext, @Arg('usernameOrId') usernameOrId: string): Promise<UserWithMeta> {
    const currentUser = ctx.user?.id;
    const user: UserWithMeta = await this.userFindById(usernameOrId, currentUser);
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
  async updateUser(@Ctx() ctx:MyContext, @Arg('userId') userId: number, @Arg('userData') userData: UpdateUserDto): Promise<User> {
    const currentUser = ctx.user?.id;
    const user: User = await this.userUpdate(currentUser, userId, userData);
    return user;
  }

  @Mutation(() => User, {
    description: 'Admin user update',
  })
  async updateUserAdmin(@Arg('userId') userId: number, @Arg('userData') userData: AdminUpdateUserDto, @Ctx() ctx:MyContext): Promise<User> {
    console.log(ctx.user)
    if (!isStaff(ctx.user)) {
      throw new Error("You don't have permission to access this resource");
    }
    const user: User = await this.adminUserUpdate(userId, userData);
    return user;
  }

  //Mutation for userRoleUpdate
  // @Authorized()
  @Mutation(() => User, {
    description: 'User update role',
  })
  async addUserRole(@Arg('userId') userId: number, @Arg('roleId') roleId: number, @Ctx() ctx:MyContext  ): Promise<User> {
    if (!isStaff(ctx.user)) {
      throw new Error("You don't have permission to access this resource");
    }
    const user: User = await this.userRoleUpdate(userId, roleId);
    return user;
  }

  @Mutation(() => User, {
    description: 'User remove role',
  })
  async removeUserRole(@Arg('userId') userId: number, @Arg('roleId') roleId: number, @Ctx() ctx:MyContext  ): Promise<User> {
    if (!isStaff(ctx.user)) {
      throw new Error("You don't have permission to access this resource");
    }
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
