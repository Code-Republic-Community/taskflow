const os = require("node:os");
const mongoose = require("mongoose");
const config = require("../config/env");

let listenersAttached = false;

function attachListeners() {
  if (listenersAttached || config.isTest) return;
  listenersAttached = true;
  const { connection } = mongoose;
  connection.on("connected", () => console.info(`[db] connected to ${connection.name}`));
  connection.on("disconnected", () => console.warn("[db] disconnected"));
  connection.on("reconnected", () => console.info("[db] reconnected"));
  connection.on("error", (err) => console.error("[db] error:", err.message));
}

async function connectDB(uri = config.mongodbUri) {
  attachListeners();
  // The driver loads `os` with a dynamic import(), which fails inside Jest's vm sandbox and makes
  // mongod reject the handshake. Passing the module explicitly works everywhere.
  await mongoose.connect(uri, { runtimeAdapters: { os } });
  return mongoose.connection;
}

async function disconnectDB() {
  await mongoose.disconnect();
}

function isDBConnected() {
  return mongoose.connection.readyState === 1;
}

module.exports = { connectDB, disconnectDB, isDBConnected };
