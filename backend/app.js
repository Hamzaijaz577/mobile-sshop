const express = require("express");
const cors = require("cors");
const { getDb } = require("./db");

const app = express();

// FRONTEND_URL env variable set karein jab frontend deploy ho jaye
// e.g. FRONTEND_URL=https://mobile-store.vercel.app
const allowedOrigin = process.env.FRONTEND_URL;
app.use(
  cors({
    origin: allowedOrigin ? allowedOrigin : "*",
  })
);
app.use(express.json());

// ---- Simple admin auth middleware (header based) ----
// Dashboard requests must send header: x-admin-key: admin123
const ADMIN_KEY = process.env.ADMIN_KEY || "admin123";
function requireAdmin(req, res, next) {
  const key = req.headers["x-admin-key"];
  if (key !== ADMIN_KEY) {
    return res.status(401).json({ error: "Unauthorized. Admin key required." });
  }
  next();
}

// Helper: get the products collection
async function getProducts() {
  const db = await getDb();
  return db.collection("products");
}

// Helper: strip Mongo's internal _id before sending to client
function clean(doc) {
  if (!doc) return doc;
  const { _id, ...rest } = doc;
  return rest;
}

// ================= PUBLIC ROUTES (Customer-facing) =================

// Get all products (customers see this on the website)
app.get("/api/products", async (req, res) => {
  try {
    const products = await getProducts();
    const all = await products.find({}).sort({ id: 1 }).toArray();
    res.json(all.map(clean));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// Get single product
app.get("/api/products/:id", async (req, res) => {
  try {
    const products = await getProducts();
    const product = await products.findOne({ id: parseInt(req.params.id) });
    if (!product) return res.status(404).json({ error: "Product not found" });
    res.json(clean(product));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// ================= ADMIN ROUTES (Dashboard) =================

// Admin login check
app.post("/api/admin/login", (req, res) => {
  const { key } = req.body;
  if (key === ADMIN_KEY) {
    return res.json({ success: true, message: "Login successful" });
  }
  res.status(401).json({ success: false, message: "Invalid admin key" });
});

// Get all products for dashboard (same data, but protected)
app.get("/api/admin/products", requireAdmin, async (req, res) => {
  try {
    const products = await getProducts();
    const all = await products.find({}).sort({ id: 1 }).toArray();
    res.json(all.map(clean));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// Add new product
app.post("/api/admin/products", requireAdmin, async (req, res) => {
  try {
    const products = await getProducts();
    const { name, brand, price, quantity, image, description } = req.body;

    if (!name || !brand || price == null) {
      return res.status(400).json({ error: "name, brand and price are required" });
    }

    const last = await products.find({}).sort({ id: -1 }).limit(1).toArray();
    const nextId = last.length ? last[0].id + 1 : 1;

    const newProduct = {
      id: nextId,
      name,
      brand,
      price: Number(price),
      quantity: Number(quantity) || 0,
      outOfStock: Number(quantity) > 0 ? false : true,
      image: image || "https://placehold.co/300x300?text=No+Image",
      description: description || "",
    };

    await products.insertOne(newProduct);
    res.status(201).json(newProduct);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// Update product quantity (increase / decrease stock)
app.patch("/api/admin/products/:id/quantity", requireAdmin, async (req, res) => {
  try {
    const products = await getProducts();
    const product = await products.findOne({ id: parseInt(req.params.id) });
    if (!product) return res.status(404).json({ error: "Product not found" });

    const { change } = req.body; // e.g. { change: 5 } or { change: -2 }
    if (typeof change !== "number") {
      return res.status(400).json({ error: "'change' must be a number" });
    }

    const newQuantity = Math.max(0, product.quantity + change);
    const outOfStock = newQuantity === 0;

    await products.updateOne(
      { id: product.id },
      { $set: { quantity: newQuantity, outOfStock } }
    );

    res.json({ ...clean(product), quantity: newQuantity, outOfStock });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// Set exact quantity
app.patch("/api/admin/products/:id/set-quantity", requireAdmin, async (req, res) => {
  try {
    const products = await getProducts();
    const product = await products.findOne({ id: parseInt(req.params.id) });
    if (!product) return res.status(404).json({ error: "Product not found" });

    const { quantity } = req.body;
    if (typeof quantity !== "number" || quantity < 0) {
      return res.status(400).json({ error: "'quantity' must be a non-negative number" });
    }

    const outOfStock = quantity === 0;
    await products.updateOne({ id: product.id }, { $set: { quantity, outOfStock } });

    res.json({ ...clean(product), quantity, outOfStock });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// Toggle / set out-of-stock status directly
app.patch("/api/admin/products/:id/stock-status", requireAdmin, async (req, res) => {
  try {
    const products = await getProducts();
    const product = await products.findOne({ id: parseInt(req.params.id) });
    if (!product) return res.status(404).json({ error: "Product not found" });

    const { outOfStock } = req.body;
    if (typeof outOfStock !== "boolean") {
      return res.status(400).json({ error: "'outOfStock' must be true or false" });
    }

    const update = { outOfStock };
    if (outOfStock) update.quantity = 0;

    await products.updateOne({ id: product.id }, { $set: update });

    res.json({ ...clean(product), ...update });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// Update general product details
app.put("/api/admin/products/:id", requireAdmin, async (req, res) => {
  try {
    const products = await getProducts();
    const product = await products.findOne({ id: parseInt(req.params.id) });
    if (!product) return res.status(404).json({ error: "Product not found" });

    const { name, brand, price, image, description } = req.body;
    const update = {
      name: name ?? product.name,
      brand: brand ?? product.brand,
      price: price != null ? Number(price) : product.price,
      image: image ?? product.image,
      description: description ?? product.description,
    };

    await products.updateOne({ id: product.id }, { $set: update });
    res.json({ ...clean(product), ...update });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// Delete product
app.delete("/api/admin/products/:id", requireAdmin, async (req, res) => {
  try {
    const products = await getProducts();
    const product = await products.findOne({ id: parseInt(req.params.id) });
    if (!product) return res.status(404).json({ error: "Product not found" });

    await products.deleteOne({ id: product.id });
    res.json({ success: true, removed: clean(product) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = app;
