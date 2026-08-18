// Run once to load the starter products into MongoDB:
//   node seed.js
// Make sure MONGODB_URI is set (in a .env file locally, or as an env var).
require("dotenv").config();
const { getDb } = require("./db");
const seedData = require("./data.json");

async function seed() {
  const db = await getDb();
  const products = db.collection("products");

  const count = await products.countDocuments();
  if (count > 0) {
    console.log(`Collection already has ${count} product(s). Skipping seed.`);
    console.log("Delete the collection in MongoDB Atlas first if you want to reseed.");
    process.exit(0);
  }

  await products.insertMany(seedData.products);
  console.log(`Seeded ${seedData.products.length} products into MongoDB.`);
  process.exit(0);
}

seed().catch((err) => {
  console.error("Seeding failed:", err);
  process.exit(1);
});
