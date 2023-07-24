import { hash } from 'bcrypt';
import { EntityRepository } from 'typeorm';
import { CreateUserDto, UpdateUserDto } from '@dtos/users.dto';
import { UserEntity } from '@entities/users.entity';
import { HttpException } from '@exceptions/httpException';
import { User } from '@interfaces/users.interface';
import { ProfileEntity } from '@/entities/profile.entity';

@EntityRepository(UserEntity)
export class UserRepository {
  public async userFindAll(): Promise<User[]> {
    const users: User[] = await UserEntity.createQueryBuilder("user").leftJoinAndSelect("user.profile", "profile").getMany();
    console.log(users)
    return users;
  }

  public async userFindById(userId: number): Promise<User> {
    const user: User = await UserEntity.findOne({ where: { id: userId }, relations: ['profile'] });
    if (!user) throw new HttpException(409, "User doesn't exist");
    console.log(user)
    return user;
  }

  public async userCreate(userData: CreateUserDto): Promise<User> {
    const findUser: User = await UserEntity.findOne({ where: { email: userData.email } });
    if (findUser) throw new HttpException(409, `This email ${userData.email} already exists`);

    const hashedPassword = await hash(userData.password, 10);
    const createUserData: User = await UserEntity.create({ ...userData, password: hashedPassword, profile: new ProfileEntity() }).save();

    return createUserData;
  }

  public async userUpdate(userId: number, userData: UpdateUserDto): Promise<User> {
    const findUser: User = await UserEntity.findOne({ where: { id: userId } });
    if (!findUser) throw new HttpException(409, "User doesn't exist");

    if (userData.password){
      const hashedPassword = await hash(userData.password, 10);
      await UserEntity.update(userId, { ...userData, password: hashedPassword });
    }

    userData.isApproved? await UserEntity.update(userId, { ...userData, isApproved: userData.isApproved }): null
    userData.isStaff? await UserEntity.update(userId, { ...userData, isStaff: userData.isStaff }): null
    userData.isSuperAdmin? await UserEntity.update(userId, { ...userData, isSuperAdmin: userData.isSuperAdmin }): null

    const updateUser: User = await UserEntity.findOne({ where: { id: userId } });
    return updateUser;
  }

  public async userDelete(userId: number): Promise<User> {
    const findUser: User = await UserEntity.findOne({ where: { id: userId } });
    if (!findUser) throw new HttpException(409, "User doesn't exist");

    await UserEntity.delete({ id: userId });
    return findUser;
  }
}
