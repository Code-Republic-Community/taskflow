import { Router } from "express";
import { healthRoutes } from "./health.routes.ts";
import { authRoutes } from "./auth.routes.ts";

// Each track mounts its router here, e.g. router.use("/projects", projectRoutes).
export const router = Router();

router.use("/health", healthRoutes);
router.use("/auth/", authRoutes);
