import passport from 'passport';
import * as controller from './controller';
import { Router } from 'express';
import { UserEntity } from '@/entities/users.entity';
import cookieParser from 'cookie-parser';
const CLIENT_URL = "http://localhost:3000";

const router = Router();

// router.post('/login', controller.login);

router.get("/google", passport.authenticate("google", { scope: ["profile", "email"] }));

router.get(
  "/google/callback", passport.authenticate("google", {
      failureRedirect: `${CLIENT_URL}/signin`,
    }), (req, res)=> {
      console.log("I am here")
      // const cookies = cookieParser(req.cookies)
      // cookies.get("redirectTo")
      console.log("cookies", req.cookies)
      let redirectTo = "";
      try {
         redirectTo = req.cookies["redirectTo"]
      } catch (error) {

      }

      if (redirectTo) {
        redirectTo = `${CLIENT_URL}${redirectTo}`
      }
      else redirectTo = `${CLIENT_URL}/`

      return res.redirect(redirectTo)
    });

router.post('/login',
  passport.authenticate('local'),
  function(req, res) {
    console.log("I am here")
    return res.json({"status": "success"})
  });

router.get('/session', (req, res) => {
  return res.json(req.session)
})

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
