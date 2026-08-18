const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 5000;
const DATA_FILE = path.join(__dirname, "data.json");

// FRONTEND_URL env variable set karein jab Vercel par frontend deploy ho jaye
// e.g. FRONTEND_URL=https://mobile-store.vercel.app
const allowedOrigin = process.env.FRONTEND_URL;
app.use(
  cors({
    origin: allowedOrigin ? allowedOrigin : "*",
  })
);
app.use(express.json());

// ---- Helpers to read/write JSON "database" ----
function readData() {
  const raw = fs.readFileSync(DATA_FILE, "utf-8");
  return JSON.parse(raw);
}

function writeData(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

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

// ================= PUBLIC ROUTES (Customer-facing) =================

// Get all products (customers see this on the website)
app.get("/api/products", (req, res) => {
  const data = readData();
  res.json(data.products);
});

// Get single product
app.get("/api/products/:id", (req, res) => {
  const data = readData();
  const product = data.products.find((p) => p.id === parseInt(req.params.id));
  if (!product) return res.status(404).json({ error: "Product not found" });
  res.json(product);
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
app.get("/api/admin/products", requireAdmin, (req, res) => {
  const data = readData();
  res.json(data.products);
});

// Add new product
app.post("/api/admin/products", requireAdmin, (req, res) => {
  const data = readData();
  const { name, brand, price, quantity, image, description } = req.body;

  if (!name || !brand || price == null) {
    return res.status(400).json({ error: "name, brand and price are required" });
  }

  const newProduct = {
    id: data.products.length ? Math.max(...data.products.map((p) => p.id)) + 1 : 1,
    name,
    brand,
    price: Number(price),
    quantity: Number(quantity) || 0,
    outOfStock: Number(quantity) > 0 ? false : true,
    image: image || "https://placehold.co/300x300?text=No+Image",
    description: description || "",
  };

  data.products.push(newProduct);
  writeData(data);
  res.status(201).json(newProduct);
});

// Update product quantity (increase / decrease stock)
app.patch("/api/admin/products/:id/quantity", requireAdmin, (req, res) => {
  const data = readData();
  const product = data.products.find((p) => p.id === parseInt(req.params.id));
  if (!product) return res.status(404).json({ error: "Product not found" });

  const { change } = req.body; // e.g. { change: 5 } or { change: -2 }
  if (typeof change !== "number") {
    return res.status(400).json({ error: "'change' must be a number" });
  }

  product.quantity = Math.max(0, product.quantity + change);
  product.outOfStock = product.quantity === 0;

  writeData(data);
  res.json(product);
});

// Set exact quantity
app.patch("/api/admin/products/:id/set-quantity", requireAdmin, (req, res) => {
  const data = readData();
  const product = data.products.find((p) => p.id === parseInt(req.params.id));
  if (!product) return res.status(404).json({ error: "Product not found" });

  const { quantity } = req.body;
  if (typeof quantity !== "number" || quantity < 0) {
    return res.status(400).json({ error: "'quantity' must be a non-negative number" });
  }

  product.quantity = quantity;
  product.outOfStock = quantity === 0;

  writeData(data);
  res.json(product);
});

// Toggle / set out-of-stock status directly
app.patch("/api/admin/products/:id/stock-status", requireAdmin, (req, res) => {
  const data = readData();
  const product = data.products.find((p) => p.id === parseInt(req.params.id));
  if (!product) return res.status(404).json({ error: "Product not found" });

  const { outOfStock } = req.body;
  if (typeof outOfStock !== "boolean") {
    return res.status(400).json({ error: "'outOfStock' must be true or false" });
  }

  product.outOfStock = outOfStock;
  if (outOfStock) product.quantity = 0;

  writeData(data);
  res.json(product);
});

// Update general product details
app.put("/api/admin/products/:id", requireAdmin, (req, res) => {
  const data = readData();
  const idx = data.products.findIndex((p) => p.id === parseInt(req.params.id));
  if (idx === -1) return res.status(404).json({ error: "Product not found" });

  const { name, brand, price, image, description } = req.body;
  const product = data.products[idx];

  data.products[idx] = {
    ...product,
    name: name ?? product.name,
    brand: brand ?? product.brand,
    price: price != null ? Number(price) : product.price,
    image: image ?? product.image,
    description: description ?? product.description,
  };

  writeData(data);
  res.json(data.products[idx]);
});

// Delete product
app.delete("/api/admin/products/:id", requireAdmin, (req, res) => {
  const data = readData();
  const idx = data.products.findIndex((p) => p.id === parseInt(req.params.id));
  if (idx === -1) return res.status(404).json({ error: "Product not found" });

  const removed = data.products.splice(idx, 1);
  writeData(data);
  res.json({ success: true, removed: removed[0] });
});

app.listen(PORT, () => {
  console.log(`Backend server running at http://localhost:${PORT}`);
  console.log(`Admin key: ${ADMIN_KEY}`);
});
