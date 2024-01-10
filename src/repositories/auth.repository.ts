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
import { mailConfig } from '@/config/mail';
import crypto from 'crypto'

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
    const emailVerificationToken = crypto.randomBytes(32).toString('hex');
    
    const createUserData: User = await UserEntity.create({ 
      ...userData,
      password: hashedPassword, 
      profile: profile,
      emailVerificationToken,
      emailVerificationTokenExpiresAt: new Date(new Date().setHours(new Date().getHours() + 1))
     }).save();
    
    
    const trasporter = createTransport(mailConfig)

    const mailOptions = {
      from: "care@swojon.com",
      to: userData.email,
      subject: "Verify Your Email Address and Join the Swojon Community!",
      text: `
Dear ${userData.username},

Thank you for joining Swojon, your go-to marketplace for good people! To ensure the security of your account and keep you connected with our vibrant community, we need to verify your email address.

Please click on the following link to verify your email:

{https://www.swojon.com/verify-email/${emailVerificationToken}

(Note: If the link is not clickable, please copy and paste it into your web browser.)

By verifying your email, you'll gain full access to all the features Swojon has to offer, including secure transactions, personalized recommendations, and a seamless community experience.

If you did not create an account with Swojon, please disregard this email.

If you have any questions or need assistance, feel free to reach out to our support team at [support@swojon.com].

We're excited to have you as part of the Swojon community!

Best regards,

The Swojon Team
www.swojon.com
www.facebook.com/swojon`,
    } 
    try {
      const mail = await trasporter.sendMail(mailOptions)
      console.log(mail)
    } catch (error) {
      console.log(error)
    }
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
