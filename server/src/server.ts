import { config } from "./config/env.ts";
import { connectDB, disconnectDB } from "./data/db.ts";
import { createApp } from "./app.ts";

async function start(): Promise<void> {
  try {
    await connectDB();
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(`[server] could not connect to MongoDB at ${config.mongodbUri}: ${message}`);
    process.exit(1);
  }

  const server = createApp().listen(config.port, () => {
    console.info(`[server] listening on http://localhost:${config.port} (${config.nodeEnv})`);
  });

  const shutdown = (signal: NodeJS.Signals): void => {
    console.info(`[server] ${signal} received, shutting down`);
    server.close(async () => {
      await disconnectDB();
      process.exit(0);
    });
  };
  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);
}

void start();
