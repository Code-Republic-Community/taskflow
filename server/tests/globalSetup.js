const { MongoMemoryServer } = require("mongodb-memory-server");

module.exports = async function globalSetup() {
  const mongod = await MongoMemoryServer.create();
  globalThis.__MONGOD__ = mongod;
  process.env.MONGODB_URI = mongod.getUri("taskflow-test");
};
