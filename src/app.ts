import 'reflect-metadata';

import { ApolloServerPluginLandingPageProductionDefault, ApolloServerPluginLandingPageLocalDefault } from 'apollo-server-core';
import { ApolloServer } from 'apollo-server-express';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import hpp from 'hpp';
import { createServer } from 'http';
// import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer';
import { WebSocketServer } from 'ws';
import { useServer } from 'graphql-ws/lib/use/ws';

import { buildSchema } from 'type-graphql';
import { createConnection } from 'typeorm';
import { NODE_ENV, PORT, ORIGIN, CREDENTIALS } from '@config';
import { dbConnection } from '@database';
import { AuthJWTMiddleware, getUser } from '@middlewares/auth.middleware';
import { ErrorMiddleware } from '@middlewares/error.middleware';
import { logger, responseLogger, errorLogger } from '@utils/logger';
// import * as  Server from 'socket.io';
// import Redis from 'ioredis';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { redis } from "./redis";
import router from './authentication/route';
import { pubSub } from './pubsub';
import { ApolloServerPluginDrainHttpServer } from 'apollo-server-core/dist/plugin/drainHttpServer';
import { ValidateEnv } from './utils/validateEnv';
import { AuthResolver } from './resolvers/auth.resolver';
import { CategoryResolver } from './resolvers/category.resolver';
import { ChatResolver } from './resolvers/chat.resolver';
import { CommunityResolver } from './resolvers/community.resolver';
import { CommunityMemberResolver } from './resolvers/communityMember.resolver';
import { FollowResolver } from './resolvers/follow.resolver';
import { ProfileResolver } from './resolvers/profile.resolver';
import { RoleResolver } from './resolvers/role.resolver';
import { SubscriptionResolver } from './resolvers/subscription.resolver';
import { UserResolver } from './resolvers/users.resolver';
import { BrandResolver } from './resolvers/brand.resolver';
import { ListingResolver } from './resolvers/listing.resolver';
import { FavoriteResolver } from './resolvers/favorite.resolver';
import { SellerReviewResolver } from './resolvers/sellerReview.resolver';
import { LocationResolver } from './resolvers/location.resolver';
import { PointResolver } from './resolvers/point.resolver';
import passport from 'passport';
import { UserEntity } from './entities/users.entity';
import { SearchResolver } from './resolvers/search.resolver';
import { NotificationResolver } from './resolvers/notification.resolver';
import Keyv from 'keyv';
import { KeyvAdapter } from '@apollo/utils.keyvadapter';
import { OrderRatioResolver } from './resolvers/orderRatio.resolver';
import { CollectionResolver } from './resolvers/collection.resolver';
import { OrderResolver } from './resolvers/order.resolver';

const passportSetup = require('./utils/passport');

// const redis = new Redis({
//   port: 6379,
//   host: 'localhost',
// });

// const graphqlHTTP = require('express-graphql')

(async () =>  {


ValidateEnv();

const env = NODE_ENV || 'development';
const port = PORT || 3000;

const app = express();
createConnection(dbConnection);

if (env === 'production') {
  app.use(hpp());
  app.use(helmet());
}

// const sessionMiddleware = session({
//   // store: new RedisStore({
//   //   client: redis as any
//   // }),
//   name: COOKIE_NAME,
//   secret: COOKIE_SECRET,
//   resave: false,
//   saveUninitialized: false,
//   cookie: {
//     httpOnly: true,
//     secure: env === "production",
//     maxAge: 1000*60*5, //5 minutes ,//1000 * 60 * 60 * 24 * 7 * 365, // 7 years,
//     sameSite: "none"
//   }
// })

// app.use(sessionMiddleware);

app.use(passport.initialize());
// app.use(passport.session());

app.use(cors({ origin: ORIGIN.split(','), credentials: CREDENTIALS}));
// app.use(cors({origin : "*", credentials: CREDENTIALS}))
app.use(compression());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.set('trust proxy', true)


console.log("Initializing apollo server")
const schema = await buildSchema({
  resolvers: [
    AuthResolver, CategoryResolver, ProfileResolver, RoleResolver, FollowResolver,
    CommunityResolver, CommunityMemberResolver, CategoryResolver, LocationResolver, ChatResolver,
     SubscriptionResolver, UserResolver, BrandResolver, ListingResolver, FavoriteResolver,
    SellerReviewResolver, PointResolver, SearchResolver, NotificationResolver, OrderRatioResolver,
    CollectionResolver, OrderResolver
  ],
  pubSub: pubSub,
  authChecker: AuthJWTMiddleware,
});

const httpServer = createServer(app);
const wsServer = new WebSocketServer({
  // This is the `httpServer` we created in a previous step.
  server: httpServer,
  // Pass a different path here if app.use
  // serves expressMiddleware at a different path
  path: '/graphql',

});

const sessionContext: Record<string, unknown> = {};
const getDynamicContext = async (ctx, msg, args) => {
  // ctx is the graphql-ws Context where connectionParams live
 if (ctx.connectionParams?.headers?.Authorization || ctx.connectionParams?.Authorization) {
    try {
      const token = ctx.connectionParams?.headers?.Authorization ?? ctx.connectionParams?.Authorization;

      const decoded: JwtPayload | string = jwt.verify(token.replace('Bearer ', ""), process.env.SECRET_KEY)
      // console.log("decoded", decoded)
      const currentUser = await UserEntity.findOne({
        // @ts-ignore
        where: { id: decoded.id }, select: ["email", 'username', 'id'], relations: ['roles']});
      return { currentUser };
    } catch (error) {
      return { currentUser: null };
    }
  }
  // Otherwise let our resolvers know we don't have a current user

};

const serverCleanup = useServer({
  schema ,
  context: (ctx, msg, args) => {
    // Returning an object will add that information to our
    // GraphQL context, which all of our resolvers have access to.
   return getDynamicContext(ctx, msg, args)
  },
  onConnect(ctx) {
  }
  // context: async req => {
  //     // try to retrieve a user with the token
  //   // const user = await getUser(req, res);
  //   // return { req, res, connect, user };
  //   return req

  //   // return { req, res, connect }
  // },


  // },

}, wsServer);

const apolloServer = new ApolloServer({
  schema: schema,
  // cache: 'bounded',
  cache: new KeyvAdapter(new Keyv()),
  plugins: [
    env === 'production'
      ? ApolloServerPluginLandingPageProductionDefault({ footer: false, includeCookies: true })
      : ApolloServerPluginLandingPageLocalDefault({ footer: false, embed: true, includeCookies: true }),
      ApolloServerPluginDrainHttpServer({ httpServer: httpServer}),
      {async serverWillStart() {
          console.log("Server starting");
          return {
            async drainServer() {
              await serverCleanup.dispose();
            },
          }
        }
      }
      // :ApolloServerPluginLandingPageGraphQLPlayground({ settings: { 'request.credentials': 'include' } }),
  ],
  context: async ({ req, res, connect }: any) => {
    // console.log(req, res)
    // get the user token from the headers
    // console.log("req", req.headers)
    const token = req.headers.authorization || '';

    // try to retrieve a user with the token
    const user = await getUser(req, res);
    // console.log("user apollo", user)
    return { req, res, connect, user, redis };

    // return { req, res, connect }
  }
    ,
  formatResponse: (response, request) => {
    responseLogger(request);

    return response;
  },
  formatError: error => {
    try {
      errorLogger(error);
      return error;
    } catch (err) {
      return new Error(err);
    }
  },
});


app.use('/auth', router ) //auth route
await apolloServer.start();
apolloServer.applyMiddleware({ app, cors: false, path: '/graphql' });
app.use(ErrorMiddleware);

httpServer.listen(port, () => {
    logger.info(`=================================`);
    logger.info(`======= ENV: ${env} =======`);
    logger.info(`🚀 App listening on the port ${port}`);
    logger.info(`🎮 http://localhost:${port}/graphql`);
    logger.info(`=================================`);
});

})();
