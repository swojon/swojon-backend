// const GithubStrategy = require("passport-github2").Strategy;
// const FacebookStrategy = require("passport-facebook").Strategy;
import { UserEntity } from '@/entities/users.entity';
import { compare } from 'bcrypt';
import passport from 'passport';
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import {Strategy as LocalStrategy} from 'passport-local';
import { Strategy as JWTStrategy, ExtractJwt } from 'passport-jwt'

export const GOOGLE_CLIENT_ID = "289456051793-3ltve2koi2m13g1819uhnbjigse41iug.apps.googleusercontent.com"
export const GOOGLE_CLIENT_SECRET = "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";

passport.use(
  new GoogleStrategy(
    {
      clientID: GOOGLE_CLIENT_ID,
      clientSecret: GOOGLE_CLIENT_SECRET,
      callbackURL: `${process.env.BASE_URL}/auth/google/callback`,
    },
    async function (accessToken, refreshToken, profile, done) {
      console.log("acces Token", accessToken)
      console.log("Got profile", profile)

      const googleId = profile["id"]
      let findUser = await UserEntity.findOne({
          where: {googleId: googleId},
          select: ["id", "email", "username"],
          relations: ["roles"],
        });

      if (!findUser){
        const profileData = profile._json

        const newProfile = {
          name : `${profileData.given_name} ${profileData.family_name}` ,
          avatar: profileData.picture
        }
        await UserEntity.create({
          googleId: googleId,
          email: profileData.email,
          isEmailVerified: !!profileData.email_verified,
          profile: newProfile
        }).save();

        findUser = await UserEntity.findOne({
          where: {googleId: googleId},
          select: ["id", "email", "username", "isAdmin", "isModerator", "isStaff", "isSuspended"],
          relations: ["roles"],
        });
      }

      if (findUser.isSuspended) return done("This account is suspended", false)
      done(null, findUser);
    }
  )
);

passport.use(new LocalStrategy(
  async function(username, password, done) {
    //db call here

    const findUser = await UserEntity.findOne({
              select: ["id", "email", "username", "password", "isStaff", "isModerator", "isAdmin", "isSuspended"],
              where: { email: username }
    });

    if (!findUser) return done("User not found", false)
    if (findUser.isSuspended) return done("This account is suspended", false)
    if (findUser.password == null) return done("Password is not set for this user. Please use other login method", false)
    const matched = await compare(password, findUser.password)
    if (!matched) { return done(null, false); }

    delete findUser.password

    return done(null, findUser);

  }
));

passport.use(new JWTStrategy({
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey   : process.env.SECRET_KEY
},
async function (jwtPayload: {
  id: number,
  iat: Date,
}, cb) {

  //find the user in db if needed. This functionality may be omitted if you store everything you'll need in JWT payload.
  const findUser = await  UserEntity.findOne({
    where: {id: jwtPayload.id},
    select: ["id", "email", "username", "isAdmin", "isModerator", "isStaff", "isSuspended"]
  })

  if (!findUser) return cb("Something Went Wrong");

  return cb(null, findUser);
}
));

// passport.use(
//   new GithubStrategy(
//     {
//       clientID: GITHUB_CLIENT_ID,
//       clientSecret: GITHUB_CLIENT_SECRET,
//       callbackURL: "/auth/github/callback",
//     },
//     function (accessToken, refreshToken, profile, done) {
//       done(null, profile);
//     }
//   )
// );

// passport.use(
//   new FacebookStrategy(
//     {
//       clientID: FACEBOOK_APP_ID,
//       clientSecret: FACEBOOK_APP_SECRET,
//       callbackURL: "/auth/facebook/callback",
//     },
//     function (accessToken, refreshToken, profile, done) {
//       done(null, profile);
//     }
//   )
// );

passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((user, done) => {
  done(null, user);
});

