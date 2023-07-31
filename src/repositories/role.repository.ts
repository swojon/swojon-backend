import { CreateRoleDTO } from "@/dtos/role.dto";
import { RoleEntity } from "@/entities/role.entity";
import { HttpException } from "@/exceptions/httpException";
import { Role } from "@/interfaces/role.interface";

import { EntityRepository } from "typeorm";


@EntityRepository(RoleEntity)
export class RoleRepository{
  //list all roles
  public async roleFindAll(): Promise<Role[]>{
    const roles: Role[] = await RoleEntity.find();
    return roles;

  }

  public async roleCreate(roleData: CreateRoleDTO): Promise<Role> {
    const findRole: Role = await RoleEntity.findOne({ where: { name: roleData.name } });
    if (findRole) throw new HttpException(409, `This role ${roleData.name} already exists`);

    const createRoleData: Role = await RoleEntity.create(roleData).save();

    return createRoleData;
  }
}
