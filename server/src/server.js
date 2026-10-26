const config = require("./config/env");
const { connectDB, disconnectDB } = require("./data/db");
const createApp = require("./app");

async function start() {
  try {
    await connectDB();
  } catch (err) {
    console.error(`[server] could not connect to MongoDB at ${config.mongodbUri}: ${err.message}`);
    process.exit(1);
  }

  const server = createApp().listen(config.port, () => {
    console.info(`[server] listening on http://localhost:${config.port} (${config.nodeEnv})`);
  });

  const shutdown = (signal) => {
    console.info(`[server] ${signal} received, shutting down`);
    server.close(async () => {
      await disconnectDB();
      process.exit(0);
    });
  };
  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);
}

start();
