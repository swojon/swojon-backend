import { User } from '@interfaces/users.interface';
import { Request } from "express";

export interface DataStoredInToken {
  id: number;
}

export interface TokenData {
  token: string;
  expiresIn: number;
  sessionId?: string;
  sessionMaxAge?: number;
}

export interface RequestWithUser {
  user: User;
}

export interface MyContext {
  req: Request;
  res: Response;
  user: any;
  // authorsLoader: ReturnType<typeof createAuthorsLoader>;
}

export interface IuserLogin {
  email: string;
  password: string;
}
