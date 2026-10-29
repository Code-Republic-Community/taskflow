import type { Request, Response } from "express";
import { registerService } from "../services/auth.service.ts";

export async function register(req: Request, res: Response) {
  const { name, email, password } = req.body;

  const user = await registerService(name, email, password);

  res.status(201).json({
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
