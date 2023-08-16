import 'reflect-metadata';

import { ApolloServerPluginLandingPageProductionDefault, ApolloServerPluginLandingPageLocalDefault, ApolloServerPluginLandingPageGraphQLPlayground } from 'apollo-server-core';
import { ApolloServer } from 'apollo-server-express';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import hpp from 'hpp';
import { Server, createServer } from 'http';
import {GraphQLSchema, execute, subscribe} from "graphql";
// import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer';
import { makeExecutableSchema } from '@graphql-tools/schema';
import { WebSocketServer } from 'ws';
import { useServer } from 'graphql-ws/lib/use/ws';

import { buildSchema } from 'type-graphql';
import { createConnection } from 'typeorm';
import { NODE_ENV, SUBSCRIPTION_PORT,  PORT, ORIGIN, CREDENTIALS, COOKIE_NAME, COOKIE_SECRET } from '@config';
import { dbConnection } from '@database';
import { AuthCheckerMiddleware } from '@middlewares/auth.middleware';
import { ErrorMiddleware } from '@middlewares/error.middleware';
import { logger, responseLogger, errorLogger } from '@utils/logger';
import session from "express-session";
// import * as  Server from 'socket.io';
import Redis from 'ioredis';
import RedisStore from "connect-redis";
import {redis} from "./redis"
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

const sessionMiddleware = session({
  store: new RedisStore({
    client: redis as any
  }),
  name: COOKIE_NAME,
  secret: COOKIE_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: env === "production",
    maxAge: 1000 * 60 * 60 * 24 * 7 * 365, // 7 years,
    sameSite: "lax"
  }
})

app.use(sessionMiddleware);
app.use(cors({ origin: ORIGIN, credentials: CREDENTIALS}));
app.use(compression());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());


console.log("Initializing apollo server")
const schema = await buildSchema({
  resolvers: [
    AuthResolver, CategoryResolver, ProfileResolver, RoleResolver, FollowResolver,
    CommunityResolver, CommunityMemberResolver, CategoryResolver, ChatResolver,
     SubscriptionResolver, UserResolver, BrandResolver

  ],
  pubSub: pubSub,
  authChecker: AuthCheckerMiddleware,
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
const serverCleanup = useServer({
  schema ,
  context: ({ req, res, connection }: any) => {
    return {req: {
      ...req,
      ...sessionContext
    }, res, connection}}
  ,
  onConnect(ctx) {
    // console.log("onConnect")
    return new Promise(resolve => {
      sessionMiddleware(ctx.extra.request as any, {} as any, () => {
        console.log("resolved")
        sessionContext.session = ctx.extra.request.session;
        resolve({req: ctx.extra.request, userId: ctx.extra.request.session!.userId})
      })
    })

  },

}, wsServer);

const apolloServer = new ApolloServer({
  schema: schema,
  plugins: [
    env === 'production'
      ? ApolloServerPluginLandingPageProductionDefault({ footer: false })
      : ApolloServerPluginLandingPageLocalDefault({ footer: false, embed: true, includeCookies: true }),
      ApolloServerPluginDrainHttpServer({ httpServer: httpServer}),
      {async serverWillStart() {
          return {
            async drainServer() {
              await serverCleanup.dispose();
            },
          }
        }
      }
      // :ApolloServerPluginLandingPageGraphQLPlayground({ settings: { 'request.credentials': 'include' } }),
  ],
  context: ({ req, res, connect }: any) => ({ req, res, connect }),
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
