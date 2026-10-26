import { Router } from "express";
import { isDBConnected } from "../data/db.ts";

export const healthRoutes = Router();

healthRoutes.get("/", (_req, res) => {
  res.json({ data: { status: "ok", db: isDBConnected() ? "connected" : "disconnected" } });
});
