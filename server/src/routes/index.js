const { Router } = require("express");
const healthRoutes = require("./health.routes");

// Each track mounts its router here, e.g. router.use("/projects", projectRoutes).
const router = Router();

router.use("/health", healthRoutes);

module.exports = router;
