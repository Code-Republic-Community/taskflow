import type { RequestHandler } from "express";
import { AppError } from "../utils/AppError.ts";
import { AUTH_SUCCESS } from "../constants/auth.constants.ts";

export const getMe: RequestHandler = (req, res) => {
  const user = req.user;
  if (!user) throw new AppError("Failed Authentication", 401);
  res.status(AUTH_SUCCESS.CURRENT_USER.statusCode).json({
    data: user,
  });
};
