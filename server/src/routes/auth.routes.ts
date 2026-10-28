import { Router } from "express";
import { requireAuth } from "../middlewares/requireAuth.ts";
import { getMe } from "../controllers/auth.controller.ts";

export const authRoutes = Router();

authRoutes.get("/me", requireAuth, getMe);
