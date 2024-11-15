import passport from 'passport';
import { Router } from 'express';
import { UserEntity } from '@/entities/users.entity';
const CLIENT_URL = "https://www.swojon.com";
import jwt from 'jsonwebtoken';
import { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET } from '@/utils/passport';
import {OAuth2Client} from "google-auth-library"

const router:any = Router();

// router.post('/login', controller.login);

router.get("/google", passport.authenticate("google", { scope: ["profile", "email"] }));

router.post('/google/token', async ({ body: { tokenId } }, res)=> {
  const client = new OAuth2Client({
    clientId: GOOGLE_CLIENT_ID,
    clientSecret: GOOGLE_CLIENT_SECRET
  });

  try {
    const ticket = await client.verifyIdToken({
      idToken: tokenId,
      audience: GOOGLE_CLIENT_ID,
    });
    const response = ticket.getPayload();
    if (response.iss !== 'accounts.google.com' && response.aud !== GOOGLE_CLIENT_ID)
      return res.status(400).json({ status: 'error', error: 'Bad Request' });
  
    const user = {
      email: response.email,
      image: response.picture,
      googleId: response.sub,
      email_verified: response.email_verified,
      first_name: response.given_name,
      last_name: response.family_name,
      username: response.email.split("@")[0]
    };
    
    let findUser = await UserEntity.findOne({
      where: [{googleId: user.googleId},
        {email: user.email}
      ],
      select: ["id", "email", "username", "googleId"],
      relations: ["roles"],
    });
    if (findUser && !findUser.googleId){
      return res.status(400).json({ status: 'error', error: 'An existing account with this email already uses some other authentication method. Please use that method to login' });
    }

    if (!findUser){
    
      const newProfile = {
        name : `${user.first_name} ${user.last_name}` ,
        avatar: user.image
      }
      await UserEntity.create({
        googleId: user.googleId,
        email: user.email,
        isEmailVerified: !!user.email_verified,
        profile: newProfile,
        username: user.username
      }).save();

      findUser = await UserEntity.findOne({
        where: {googleId: user.googleId},
        select: ["id", "email", "username"],
        relations: ["roles"],
      });
      
    }
    const jwtToken = await jwt.sign({
      id: findUser.id 
    }, process.env.SECRET_KEY, {expiresIn: "1hr"})
    return res.status(200).json({ status: 'success', user: findUser, token: jwtToken });
  } catch (error) {
    return res.status(400).json({ status: 'error', error: 'Bad Request' });
  }
})

router.get(
  "/google/callback", passport.authenticate("google", {
      failureRedirect: `${CLIENT_URL}/login`,
    }), (req, res)=> {

      // @ts-ignore:next-line
      const token = jwt.sign({id: req.user.id!, iat: Date.now()}, process.env.SECRET_KEY);

      // const cookies = cookieParser(req.cookies)
      // cookies.get("redirectTo")
      console.log("cookies", req.cookies)
     
      const redirectTo = `${CLIENT_URL}/login/success`
      // console.log("Redirecting To: ", redirectTo)
      // console.log("req url", req.url)
      // console.log("res", res)
      console.log("Client URL", CLIENT_URL)
      try{
        console.log("redirecting", `${redirectTo}?token=${token}`)
        return res.redirect(`${redirectTo}?token=${token}`)
      }catch(err){
        console.log("error redirecting", err)
      }
    });

// router.post('/login',
//   passport.authenticate('local'),
//   function(req, res) {
//     console.log("I am here")
//     return res.json({"status": "success"})
//   });
router.post('/login', function (req, res, next) {
  passport.authenticate('local', {session: false}, (err, user, info) => {
    console.log("Got user", user, err)
      if (err || !user) {
          return res.status(400).json({
              message: 'Something is not right',
              user   : user
          });
      }
     req.login(user, {session: false}, (err) => {
         if (err) {
             res.send(err);
         }
         // generate a signed son web token with the contents of user object and return it in the response
         const token = jwt.sign({id: user.id, iat: Date.now()}, process.env.SECRET_KEY);
         return res.json({user, token});
      });
  })(req, res);
});

router.get('/session', passport.authenticate('jwt', {session: false}),  (req, res) => {
  return res.json(req.session)
})

router.get('/profile', passport.authenticate('jwt', {session: false}),  function(req, res, next) {
  // console.log(req)
  res.send(req.user);
});

router.get('/me', async (req, res) => {
  // console.log(req)
  let userId;
  try{

    userId  = req.session.passport.user.id
  }
  catch{
     return res.status(400).json({"msg": "Unknown"})
  }


  const findUser = await UserEntity.findOne({where: {id: userId}, relations: ["roles"]})
  if (!findUser) return res.status(400).json({"msg": "Unknown"})

  return res.json({
    id: findUser.id,
    email: findUser.email,
    username: findUser.username,
    roles: findUser.roles.map(item => item.name)
  })

})
export default router;
