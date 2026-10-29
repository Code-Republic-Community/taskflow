import type { Request, Response } from "express";
import { registerService } from "../services/auth.service.ts";
import type { RequestHandler } from "express";
import { AppError } from "../utils/AppError.ts";
import { AUTH_SUCCESS } from "../constants/auth.constants.ts";

export async function register(req: Request, res: Response) {
  const { name, email, password } = req.body;

  const user = await registerService(name, email, password);

  res.status(AUTH_SUCCESS.USER_CREATED.statusCode).json({
    success: true,
    data: {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    },
  });
}

export const getMe: RequestHandler = (req, res) => {
  const user = req.user;
  if (!user) throw new AppError("Failed Authentication", 401);
  res.status(AUTH_SUCCESS.CURRENT_USER.statusCode).json({
    data: user,
  });
};
