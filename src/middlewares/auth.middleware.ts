import { verify } from 'jsonwebtoken';
import { AuthChecker } from 'type-graphql';
import { getRepository } from 'typeorm';
import { SECRET_KEY } from '@config';
import { UserEntity } from '@entities/users.entity';
import { HttpException } from '@exceptions/httpException';
import { RequestWithUser, DataStoredInToken, MyContext } from '@interfaces/auth.interface';
import { Role } from '@/interfaces/role.interface';
import { RoleEntity } from '@/entities/role.entity';
import passport from 'passport';

const getAuthorization = req => {
  const cookie = req.cookies['Authorization'];
  if (cookie) return cookie;

  const header = req.header('Authorization');
  if (header) return header.split('Bearer ')[1];

  return null;
};

export const AuthMiddleware = async req => {
  try {
    const Authorization = getAuthorization(req);

    if (Authorization) {
      const { id } = verify(Authorization, SECRET_KEY) as DataStoredInToken;
      const userRepository = getRepository(UserEntity);
      const findUser = await userRepository.findOne(id, { select: ['id', 'email', 'password'] });
      return findUser;
    }

    return null;
  } catch (error) {
    throw new HttpException(401, 'Wrong authentication token');
  }
};

export const AuthJWTMiddleware = async ({ context: { user} }, roles) => {
  try {

    if (!user) {
      throw new HttpException(401, "You don't have permission to access this resource");
    }

    if (roles.length === 0) {
      return true;
    }

    const userRolesNames = user.roles.map(role => role.name);

    if (!userRolesNames.some(role => roles.includes(role))) {
        return false;
    }

    return true;

  } catch (error) {
    console.log("error", error)
    return false
  }
};


export const AuthCheckerMiddleware: AuthChecker<MyContext> = async ({ context: { req } }, roles) => {
  console.log(req.session)
  if (!req.session!.userId) {
    throw new HttpException(401, "You don't have permission to access this resource");
  }

  if (roles.length === 0) {
    return true;
  }

  const findUser: UserEntity = await UserEntity.findOne({ where: { id: req.session!.userId }, relations: ['roles'] });

  const userRolesNames = findUser.roles.map(role => role.name);

  if (!userRolesNames.some(role => roles.includes(role))) {
      return false;
  }

  return true;
};

export const getUser = (req: Express.Request, res: Express.Response) =>
  new Promise((resolve, reject) => {
    passport.authenticate('jwt', { session: false }, (err, user) => {
      if (err) reject(err)
      resolve(user)
    })(req, res)
})
