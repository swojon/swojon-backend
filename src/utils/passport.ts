import {passport} from 'passport';
import {Strategy as FacebookTokenStrategy} from 'passport-facebook-token';
// import {Strategy as GoogleTokenStrategy} from 'passport-google-token';


// FACEBOOK STRATEGY
const FacebookTokenStrategyCallback = (accessToken, refreshToken, profile, done) => done(null, {
    accessToken,
    refreshToken,
    profile,
});

passport.use(new FacebookTokenStrategy({
    clientID: process.env.FB_APP_ID,
    clientSecret: process.env.FB_CLIENT_SECRET,
}, FacebookTokenStrategyCallback));


export const authenticateFacebook = (req, res) => new Promise((resolve, reject) => {
    passport.authenticate('facebook-token', { session: false }, (err, data, info) => {
        if (err) reject(err);
        resolve({ data, info });
    })(req, res);
});

