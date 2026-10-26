const { Router } = require("express");
const { isDBConnected } = require("../data/db");

const router = Router();

router.get("/", (_req, res) => {
  res.json({ data: { status: "ok", db: isDBConnected() ? "connected" : "disconnected" } });
});

module.exports = router;
