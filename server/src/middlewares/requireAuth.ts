import type { Types } from "mongoose";
import type { Role } from "../models/constants.ts";
import type { RequestHandler } from "express";
import { AppError } from "../utils/AppError.ts";
import jwt from "jsonwebtoken";
import { config } from "../config/env.ts";

// TODO: replace with the User model type after TF-2
declare module "express-serve-static-core" {
  interface Request {
    user?: User;
  }
}
type User = {
  _id: Types.ObjectId;
  name: string;
  email: string;
  avatarColor: string;
  role: Role;
  active: boolean;
};

export const requireAuth = (): RequestHandler => async (req, _res, next) => {
  const authorization = req.headers.authorization;
  if (!authorization) throw new AppError("Authorization failed", 401);
  const [authtype, token] = authorization.split(" ");
  if (authtype !== "Bearer" || !token) throw new AppError("Invalid token type", 401);

  let decoded: string | jwt.JwtPayload;
  try {
    decoded = jwt.verify(token, config.jwtSecret);
  } catch (err) {
    if (err instanceof jwt.TokenExpiredError) throw new AppError("Token expired", 401);
    throw new AppError("Invalid token", 401);
  }

  if (typeof decoded === "string" || !decoded.sub) throw new AppError("Payload error", 401);
  //TODO: after realise TF2`

  // const id = decoded.sub;
  // const user = await User.findById(id);
  // if(!user) throw new AppError('User not found', 401);
  // if(!user.active) throw new AppError('User is deactive', 401);
  // req.user = user;

  next();
};
