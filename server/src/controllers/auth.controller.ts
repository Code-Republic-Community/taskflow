import type { RequestHandler } from "express";
import { AppError } from "../utils/AppError.ts";

export const getMe: RequestHandler = (req, res) => {
  const user = req.user;
  if (!user) throw new AppError("Failed Authentication", 401);
  res.status(200).json({
    data: user,
  });
};
