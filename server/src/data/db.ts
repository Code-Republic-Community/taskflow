import os from "node:os";
import mongoose from "mongoose";
import { config } from "../config/env.ts";

let listenersAttached = false;

function attachListeners(): void {
  if (listenersAttached || config.isTest) return;
  listenersAttached = true;
  const { connection } = mongoose;
  connection.on("connected", () => console.info(`[db] connected to ${connection.name}`));
  connection.on("disconnected", () => console.warn("[db] disconnected"));
  connection.on("reconnected", () => console.info("[db] reconnected"));
  connection.on("error", (err: Error) => console.error("[db] error:", err.message));
}

export async function connectDB(uri: string = config.mongodbUri): Promise<mongoose.Connection> {
  attachListeners();
  // The driver loads `os` with a dynamic import(), which fails inside some test sandboxes and
  // makes mongod reject the handshake. Passing the module explicitly works everywhere.
  await mongoose.connect(uri, { runtimeAdapters: { os } });
  return mongoose.connection;
}

export async function disconnectDB(): Promise<void> {
  await mongoose.disconnect();
}

export function isDBConnected(): boolean {
  return mongoose.connection.readyState === mongoose.ConnectionStates.connected;
}
