const { MongoClient } = require("mongodb");

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB || "mobile_store";

if (!uri) {
  console.warn("WARNING: MONGODB_URI environment variable is not set.");
}

// Reuse the client/connection across serverless invocations (important on Vercel)
let cachedClient = global._mongoClient;
let cachedDb = global._mongoDb;

async function getDb() {
  if (cachedDb) return cachedDb;

  if (!cachedClient) {
    cachedClient = new MongoClient(uri);
    global._mongoClient = cachedClient;
  }
  if (!cachedClient.topology || !cachedClient.topology.isConnected()) {
    await cachedClient.connect();
  }

  cachedDb = cachedClient.db(dbName);
  global._mongoDb = cachedDb;
  return cachedDb;
}

module.exports = { getDb };
