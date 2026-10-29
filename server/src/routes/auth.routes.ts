import { Router } from "express";
import { register, login, getMe } from "../controllers/auth.controller.ts";
import { requireAuth } from "../middlewares/requireAuth.ts";

export const authRoutes = Router();

authRoutes.post("/register", register);

authRoutes.post("/login", login);

authRoutes.get("/me", requireAuth, getMe);
