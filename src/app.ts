import 'reflect-metadata';
import { ApolloServerPluginLandingPageProductionDefault, ApolloServerPluginLandingPageLocalDefault, ApolloServerPluginLandingPageGraphQLPlayground } from 'apollo-server-core';
import { ApolloServer } from 'apollo-server-express';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import hpp from 'hpp';
import { buildSchema } from 'type-graphql';
import { createConnection } from 'typeorm';
import { NODE_ENV, PORT, ORIGIN, CREDENTIALS, COOKIE_NAME, COOKIE_SECRET } from '@config';
import { dbConnection } from '@database';
import { AuthCheckerMiddleware } from '@middlewares/auth.middleware';
import { ErrorMiddleware } from '@middlewares/error.middleware';
import { logger, responseLogger, errorLogger } from '@utils/logger';
import session from "express-session";
// import * as  Server from 'socket.io';
import Redis from 'ioredis';
// const RedisStore = require('connect-redis')(session);
import RedisStore from "connect-redis";
import {redis} from "./redis"
import router from './authentication/route';
// const redis = new Redis({
//   port: 6379,
//   host: 'localhost',
// });

// const graphqlHTTP = require('express-graphql')
// const graphql = require('graphql')

export class App {
  public app: express.Application;
  public env: string;
  public port: string | number;

  constructor(resolvers) {
    this.app = express();
    this.env = NODE_ENV || 'development';
    this.port = PORT || 3000;

    this.connectToDatabase();
    this.initializeMiddlewares();
    this.initApolloServer(resolvers);
    // this.initGraphQLServer(resolvers);
    this.initializeErrorHandling();
  }

  public async listen() {
    this.app.listen(this.port, () => {
      logger.info(`=================================`);
      logger.info(`======= ENV: ${this.env} =======`);
      logger.info(`🚀 App listening on the port ${this.port}`);
      logger.info(`🎮 http://localhost:${this.port}/graphql`);
      logger.info(`=================================`);
    });
  }

  public getServer() {
    return this.app;
  }

  private connectToDatabase() {
    createConnection(dbConnection);
  }

  private initializeMiddlewares() {
    if (this.env === 'production') {
      this.app.use(hpp());
      this.app.use(helmet());
    }
    // this.app.set('trust proxy', this.env !== 'production')

    this.app.use(
      session({
        store: new RedisStore({
          client: redis as any
        }),
        name: COOKIE_NAME,
        secret: COOKIE_SECRET,
        resave: false,
        saveUninitialized: false,
        cookie: {
          httpOnly: true,
          secure: this.env === "production",
          maxAge: 1000 * 60 * 60 * 24 * 7 * 365, // 7 years,
          sameSite: "lax"
        }
      })
    );
    this.app.use(cors({ origin: ORIGIN, credentials: CREDENTIALS}));
    this.app.use(compression());
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));
    this.app.use(cookieParser());
  }

  //init apollo server
  private async initApolloServer(resolvers) {
    const schema = await buildSchema({
      resolvers: resolvers,
      authChecker: AuthCheckerMiddleware,
    });

    const apolloServer = new ApolloServer({
      schema: schema,
      plugins: [
        this.env === 'production'
          ? ApolloServerPluginLandingPageProductionDefault({ footer: false })
          : ApolloServerPluginLandingPageLocalDefault({ footer: false, embed: true, includeCookies: true }),
          // :ApolloServerPluginLandingPageGraphQLPlayground({ settings: { 'request.credentials': 'include' } }),
      ],
      // plugins: [],
      // context: async ({ req }) => {
      //   try {
      //     const user = await AuthMiddleware(req);
      //     return { user };
      //   } catch (error) {
      //     throw new Error(error);
      //   }
      // },
      context: ({ req }: any) => ({ req }),
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
    this.app.use('/auth', router ) //auth route
    await apolloServer.start();
    apolloServer.applyMiddleware({ app: this.app, cors: false, path: '/graphql' });
  }


  private initializeErrorHandling() {
    this.app.use(ErrorMiddleware);
  }
}
