import passport from 'passport';
import { Router } from 'express';
import { UserEntity } from '@/entities/users.entity';
const CLIENT_URL = "https://www.swojon.com";
import jwt from 'jsonwebtoken';

const router = Router();

// router.post('/login', controller.login);

router.get("/google", passport.authenticate("google", { scope: ["profile", "email"] }));

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
    console.log("Got user", user)
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
