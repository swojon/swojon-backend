import { hash, compare } from 'bcrypt';
import { sign } from 'jsonwebtoken';
import { EntityRepository } from 'typeorm';
import { COOKIE_SECRET, SECRET_KEY } from '@config';
import { CreateUserDto } from '@dtos/users.dto';
import { UserEntity } from '@entities/users.entity';
import { HttpException } from '@exceptions/httpException';
import { DataStoredInToken, MyContext, TokenData } from '@interfaces/auth.interface';
import { User } from '@interfaces/users.interface';
import { ProfileEntity } from '@/entities/profile.entity';
import cookieParser from 'cookie-parser';
import {createTransport} from 'nodemailer';
import { SMTP_HOST, SMTP_PASSWORD, SMTP_USERNAME, SMTP_PORT } from '@/config';
// import { cookies } from 'next/headers';

// import { SocialAuthInput } from '@/typedefs/auth.type';
// import { authenticateFacebook } from '@/utils/passport';

const createToken = (user: User): TokenData => {
  const dataStoredInToken: DataStoredInToken = { id: user.id };
  const expiresIn: number = 30 * 24 * 60 * 60; // 30 days

  return { expiresIn, token: sign(dataStoredInToken, SECRET_KEY, { expiresIn }) };
};

const createCookie = (tokenData: TokenData): string => {
  return `Authorization=${tokenData.token}; HttpOnly; Max-Age=${tokenData.expiresIn};`;
};

@EntityRepository(UserEntity)
export class AuthRepository {
  public async userSignUp(userData: CreateUserDto): Promise<User> {
    const findUser: User = await UserEntity.findOne({ where: { email: userData.email } });
    if (findUser) throw new HttpException(409, `This email ${userData.email} already exists`);

    const hashedPassword = await hash(userData.password, 10);
    const profile: ProfileEntity = await new ProfileEntity().save();
    const createUserData: User = await UserEntity.create({ ...userData, password: hashedPassword, profile: profile }).save();
    
    const trasporter = createTransport({
      host: "email-smtp.us-east-1.amazonaws.com", 
      port: 587,
      secure: true,
      auth: {
        user: SMTP_USERNAME,
        pass: SMTP_PASSWORD
      }
    })
    //   ({
    //   host : SMTP_HOST,
    //   port: SMTP_PORT,
    //   secure : true,
    //   auth: {
    //     user: SMTP_USERNAME,
    //     pass: SMTP_PASSWORD
    //   }
    // })
    const mailOptions = {
      from: "noreply@swojon.com",
      to: userData.email,
      subject: "Login Successfull",
      text: "Please verify your email to get access to the account"
    }

    const mail = await trasporter.sendMail(mailOptions)
    console.log(mail)
    console.log("created user successfully.")
    return createUserData;
  }

  public async userLogIn(userData: CreateUserDto, ctx:MyContext): Promise<{ cookie: string; tokenData: TokenData; findUser: User }> {
    const findUser: User = await UserEntity.findOne({ where: { email: userData.email } });
    if (!findUser) throw new HttpException(409, `Something went wrong! Please try again`);

    const isPasswordMatching: boolean = await compare(userData.password, findUser.password);
    if (!isPasswordMatching) throw new HttpException(409, 'Something went wrong! Please try again');

    ctx.req.session!.userId = findUser.id;
    const tokenData = {
      ...createToken(findUser), sessionId: ctx.req.sessionID, sessionMaxAge: ctx.req.session!.cookie.maxAge
    };
    let cookie_gen = cookieParser.signedCookie(ctx.req.sessionID, COOKIE_SECRET)
    console.log(cookie_gen)
    // ctx.req.session.
    console.log("cookie", ctx.req.session.cookie)
    // ctx.req.session.s
     const cookie = createCookie(tokenData);
    return { cookie, tokenData, findUser };
  }

  public async userLogOut(userId: number): Promise<User> {
    const findUser: User = await UserEntity.findOne({ where: { id: userId } });
    if (!findUser) throw new HttpException(409, "User doesn't exist");

    return findUser;
  }

  // public async facebookLogin(userData: SocialAuthInput): Promise<{ cookie: string; tokenData: TokenData; findUser: User }> {
  //     const { } =  await authenticateFacebook(userData);

  // }

}
