import { Router } from "express";
import { register } from "../controllers/auth.controller.ts";
import { requireAuth } from "../middlewares/requireAuth.ts";
import { getMe } from "../controllers/auth.controller.ts";

export const authRoutes = Router();

authRoutes.post("/register", register);

authRoutes.post("/login", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Login route works",
  });
});

authRoutes.get("/me", requireAuth, getMe);
