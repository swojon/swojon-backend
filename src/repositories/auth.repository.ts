import { hash, compare } from 'bcrypt';
import { sign } from 'jsonwebtoken';
import { EntityRepository } from 'typeorm';
import { COOKIE_SECRET, SECRET_KEY } from '@config';
import { CreateUserDto, ResetPasswordDTO } from '@dtos/users.dto';
import { UserEntity } from '@entities/users.entity';
import { HttpException } from '@exceptions/httpException';
import { DataStoredInToken, MyContext, TokenData } from '@interfaces/auth.interface';
import { ResetStatus, User } from '@interfaces/users.interface';
import { ProfileEntity } from '@/entities/profile.entity';
import cookieParser from 'cookie-parser';
import crypto from 'crypto'
import { generateToken } from '@/utils/generateToken';
import { sendPasswordResetMail, sendPasswordResetSuccessMail, sendSignUpMail } from '@/mail/sendMail';

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
    console.log("created user successfully.")
    setTimeout(() => {sendSignUpMail(createUserData)}, 1000)
    

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

  public async UsernameAvailabilityCheck(username: string):Promise<ResetStatus>{
    const findUser: UserEntity = await UserEntity.findOne({where: {username: username}})
    
    return {
      success: !findUser
    } 
  }

  public async EmailAvailabilityCheck(email: string):Promise<ResetStatus>{
    const findUser: UserEntity = await UserEntity.findOne({where: {email: email}})
    
    return {
      success: !findUser
    } 
  }
  // public async facebookLogin(userData: SocialAuthInput): Promise<{ cookie: string; tokenData: TokenData; findUser: User }> {
  //     const { } =  await authenticateFacebook(userData);

  // }

  public async passwordResetRequest(email: string):Promise<ResetStatus> {
    const findUser: UserEntity = await UserEntity.findOne({where : {email : email}});
    if (!findUser) throw new HttpException(409, "User doesn't exist");
    const token = generateToken();
    const expireAt = new Date(new Date().getTime() +1 * 3600 * 1000); //1 hour expirty time
    findUser.passwordResetToken = token;
    findUser.passwordResetTokenExpiresAt = expireAt;
    console.log("password reset token", token);
    await findUser.save()
    setTimeout(() => {sendPasswordResetMail(findUser)}, 1000)
    return {
      success: true
    }
  }

  public async passwordResetTokenValidity(token:string):Promise<ResetStatus>{
    const findUser: UserEntity = await UserEntity.findOne({where : {passwordResetToken : token}});
    if (!findUser) throw new HttpException(409, "Invalid Token");
    if (findUser.passwordResetTokenExpiresAt < new Date()){
      findUser.passwordResetToken = null
      await findUser.save()
      throw new HttpException(409, "token expired")
    }
    return {
      success: true
    }
  }
  public async passwordReset(resetData:ResetPasswordDTO): Promise<ResetStatus> {
    const findUser: UserEntity = await UserEntity.findOne({where : {passwordResetToken : resetData.token}});
    if (!findUser) throw new HttpException(409, "Invalid Token");
    
    if (findUser.passwordResetTokenExpiresAt < new Date()){
      findUser.passwordResetToken = null
      await findUser.save()
      throw new HttpException(409, "token expired")
    }

    const hashedPassword = await hash(resetData.password, 10)
    findUser.password = hashedPassword
    findUser.passwordResetToken = null
    await findUser.save()
    setTimeout(() => {sendPasswordResetSuccessMail(findUser)}, 1000)

    return {
      success: true
    }
  }
}
