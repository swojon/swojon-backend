import { Arg, Authorized, Mutation, Query, Resolver } from 'type-graphql';
import { CreateUserDto, UpdateUserDto } from '@dtos/users.dto';
import { UserRepository } from '@repositories/users.repository';
import { User } from '@typedefs/users.type';
import { RoleRepository } from '@/repositories/role.repository';
import { Role } from '@/typedefs/role.type';
import { CreateRoleDTO } from '@/dtos/role.dto';

@Resolver()
export class RoleResolver extends RoleRepository {
  // @Authorized()
  @Query(() => [Role], {
    description: 'List ALl Role',
  })
  async getRoles(): Promise<Role[]> {
    const roles: Role[] = await this.roleFindAll();
    return roles;
  }

  @Mutation(() => Role, {
    description: "Role Create"
  })
  async createRole(@Arg('roleData') roleData: CreateRoleDTO): Promise<Role>{
    const role:Role = await this.roleCreate(roleData);
    return role;
  }



  // @Authorized()
  // @Mutation(() => User, {
  //   description: 'User delete',
  // })
  // async deleteUser(@Arg('userId') userId: number): Promise<User> {
  //   const user: User = await this.userDelete(userId);
  //   return user;
  // }
}
