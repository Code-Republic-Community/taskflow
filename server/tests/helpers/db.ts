import mongoose from "mongoose";
import { connectDB, disconnectDB } from "../../src/data/db.ts";

// Shared database helpers for tests. The in-memory MongoDB is started in tests/globalSetup.ts.

export function connect(): Promise<mongoose.Connection> {
  return connectDB(process.env.MONGODB_URI);
}

// Empties every collection so each test starts from a clean database.
export async function clearDatabase(): Promise<void> {
  const collections = Object.values(mongoose.connection.collections);
  await Promise.all(collections.map((collection) => collection.deleteMany({})));
}

export function disconnect(): Promise<void> {
  return disconnectDB();
}
