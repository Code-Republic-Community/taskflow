const mongoose = require("mongoose");
const { connectDB, disconnectDB } = require("../../src/data/db");

// Shared database helpers for tests. The in-memory MongoDB is started in tests/globalSetup.js.

function connect() {
  return connectDB(process.env.MONGODB_URI);
}

// Empties every collection so each test starts from a clean database.
async function clearDatabase() {
  const collections = Object.values(mongoose.connection.collections);
  await Promise.all(collections.map((collection) => collection.deleteMany({})));
}

function disconnect() {
  return disconnectDB();
}

module.exports = { connect, clearDatabase, disconnect };
