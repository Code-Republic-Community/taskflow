import type { RequestHandler } from "express";
import { AppError } from "../utils/AppError.ts";
import jwt from "jsonwebtoken";
import { config } from "../config/env.ts";
import type { User } from "../types/auth.types.ts";
import { AUTH_ERRORS, AUTH_SCHEME } from "../constants/auth.constants.ts";

// TODO: replace with the User model type after TF-2
declare module "express-serve-static-core" {
  interface Request {
    user?: User;
  }
}

export const requireAuth: RequestHandler = async (req, _res, next) => {
  const authorization = req.headers.authorization;
  if (!authorization)
    throw new AppError(AUTH_ERRORS.MISSING_TOKEN.message, AUTH_ERRORS.MISSING_TOKEN.statusCode);
  const [authtype, token] = authorization.split(" ");
  if (authtype !== AUTH_SCHEME || !token)
    throw new AppError(
      AUTH_ERRORS.INVALID_TOKEN_TYPE.message,
      AUTH_ERRORS.INVALID_TOKEN_TYPE.statusCode,
    );

  let decoded: string | jwt.JwtPayload;
  try {
    decoded = jwt.verify(token, config.jwtSecret);
  } catch (err) {
    if (err instanceof jwt.TokenExpiredError)
      throw new AppError(AUTH_ERRORS.TOKEN_EXPIRED.message, AUTH_ERRORS.TOKEN_EXPIRED.statusCode);
    throw new AppError(AUTH_ERRORS.INVALID_TOKEN.message, AUTH_ERRORS.INVALID_TOKEN.statusCode);
  }

  if (typeof decoded === "string" || !decoded.sub)
    throw new AppError(AUTH_ERRORS.INVALID_PAYLOAD.message, AUTH_ERRORS.INVALID_PAYLOAD.statusCode);
  //TODO: after realise TF2`

  // const id: string = decoded.sub;
  // const user = await User.findById(id);
  // if(!user) throw new AppError(AUTH_ERRORS.USER_NOT_FOUND.message, AUTH_ERRORS.USER_NOT_FOUND.statusCode);
  // if(!user.active) throw new AppError(AUTH_ERRORS.USER_DEACTIVATED.message, AUTH_ERRORS.USER_DEACTIVATED.statusCode);
  // req.user = user;

  next();
};
