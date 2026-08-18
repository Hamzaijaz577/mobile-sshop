const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

function getAdminKey() {
  return localStorage.getItem("adminKey") || "";
}

// ---------- Public (customer) endpoints ----------
export async function getProducts() {
  const res = await fetch(`${BASE_URL}/products`);
  if (!res.ok) throw new Error("Failed to fetch products");
  return res.json();
}

// ---------- Admin endpoints ----------
export async function adminLogin(key) {
  const res = await fetch(`${BASE_URL}/admin/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ key }),
  });
  return res.json();
}

export async function getAdminProducts() {
  const res = await fetch(`${BASE_URL}/admin/products`, {
    headers: { "x-admin-key": getAdminKey() },
  });
  if (!res.ok) throw new Error("Unauthorized or failed to fetch");
  return res.json();
}

export async function addProduct(product) {
  const res = await fetch(`${BASE_URL}/admin/products`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-admin-key": getAdminKey(),
    },
    body: JSON.stringify(product),
  });
  if (!res.ok) throw new Error("Failed to add product");
  return res.json();
}

export async function changeQuantity(id, change) {
  const res = await fetch(`${BASE_URL}/admin/products/${id}/quantity`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      "x-admin-key": getAdminKey(),
    },
    body: JSON.stringify({ change }),
  });
  if (!res.ok) throw new Error("Failed to update quantity");
  return res.json();
}

export async function setQuantity(id, quantity) {
  const res = await fetch(`${BASE_URL}/admin/products/${id}/set-quantity`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      "x-admin-key": getAdminKey(),
    },
    body: JSON.stringify({ quantity }),
  });
  if (!res.ok) throw new Error("Failed to set quantity");
  return res.json();
}

export async function setStockStatus(id, outOfStock) {
  const res = await fetch(`${BASE_URL}/admin/products/${id}/stock-status`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      "x-admin-key": getAdminKey(),
    },
    body: JSON.stringify({ outOfStock }),
  });
  if (!res.ok) throw new Error("Failed to update stock status");
  return res.json();
}

export async function deleteProduct(id) {
  const res = await fetch(`${BASE_URL}/admin/products/${id}`, {
    method: "DELETE",
    headers: { "x-admin-key": getAdminKey() },
  });
  if (!res.ok) throw new Error("Failed to delete product");
  return res.json();
}
