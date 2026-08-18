import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  getAdminProducts,
  changeQuantity,
  setQuantity,
  setStockStatus,
  addProduct,
  deleteProduct,
} from "../api";

export default function Dashboard() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [newProduct, setNewProduct] = useState({
    name: "",
    brand: "",
    price: "",
    quantity: "",
    image: "",
    description: "",
  });
  const navigate = useNavigate();

  async function loadProducts() {
    setLoading(true);
    try {
      const data = await getAdminProducts();
      setProducts(data);
      setError("");
    } catch {
      setError("Unauthorized. Please login again.");
      localStorage.removeItem("adminKey");
      setTimeout(() => navigate("/admin"), 1200);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!localStorage.getItem("adminKey")) {
      navigate("/admin");
      return;
    }
    loadProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleQuantityChange(id, delta) {
    try {
      const updated = await changeQuantity(id, delta);
      setProducts((prev) => prev.map((p) => (p.id === id ? updated : p)));
    } catch {
      alert("Quantity update failed");
    }
  }

  async function handleSetQuantity(id, value) {
    const qty = parseInt(value, 10);
    if (isNaN(qty) || qty < 0) return;
    try {
      const updated = await setQuantity(id, qty);
      setProducts((prev) => prev.map((p) => (p.id === id ? updated : p)));
    } catch {
      alert("Quantity set failed");
    }
  }

  async function handleToggleStock(id, current) {
    try {
      const updated = await setStockStatus(id, !current);
      setProducts((prev) => prev.map((p) => (p.id === id ? updated : p)));
    } catch {
      alert("Stock status update failed");
    }
  }

  async function handleDelete(id) {
    if (!confirm("Kya aap ye product delete karna chahte hain?")) return;
    try {
      await deleteProduct(id);
      setProducts((prev) => prev.filter((p) => p.id !== id));
    } catch {
      alert("Delete failed");
    }
  }

  async function handleAddProduct(e) {
    e.preventDefault();
    try {
      const created = await addProduct({
        ...newProduct,
        price: Number(newProduct.price),
        quantity: Number(newProduct.quantity) || 0,
      });
      setProducts((prev) => [...prev, created]);
      setNewProduct({ name: "", brand: "", price: "", quantity: "", image: "", description: "" });
      setShowAddForm(false);
    } catch {
      alert("Add product failed");
    }
  }

  function logout() {
    localStorage.removeItem("adminKey");
    navigate("/admin");
  }

  if (loading) return <p className="status-msg">Loading dashboard...</p>;

  return (
    <div className="dashboard">
      <header className="header">
        <h1>🛠 Admin Dashboard</h1>
        <div className="header-actions">
          <Link to="/" className="admin-link">View Store</Link>
          <button className="logout-btn" onClick={logout}>Logout</button>
        </div>
      </header>

      <main className="container">
        {error && <p className="status-msg error">{error}</p>}

        <button className="add-btn" onClick={() => setShowAddForm((s) => !s)}>
          {showAddForm ? "Cancel" : "+ Add New Product"}
        </button>

        {showAddForm && (
          <form className="add-form" onSubmit={handleAddProduct}>
            <input required placeholder="Name" value={newProduct.name}
              onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })} />
            <input required placeholder="Brand" value={newProduct.brand}
              onChange={(e) => setNewProduct({ ...newProduct, brand: e.target.value })} />
            <input required type="number" placeholder="Price" value={newProduct.price}
              onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })} />
            <input type="number" placeholder="Quantity" value={newProduct.quantity}
              onChange={(e) => setNewProduct({ ...newProduct, quantity: e.target.value })} />
            <input placeholder="Image URL" value={newProduct.image}
              onChange={(e) => setNewProduct({ ...newProduct, image: e.target.value })} />
            <textarea placeholder="Description" value={newProduct.description}
              onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })} />
            <button type="submit">Save Product</button>
          </form>
        )}

        <table className="admin-table">
          <thead>
            <tr>
              <th>Image</th>
              <th>Name</th>
              <th>Brand</th>
              <th>Price</th>
              <th>Quantity</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id} className={p.outOfStock ? "row-out" : ""}>
                <td><img src={p.image} alt={p.name} className="thumb" /></td>
                <td>{p.name}</td>
                <td>{p.brand}</td>
                <td>Rs. {p.price.toLocaleString()}</td>
                <td>
                  <div className="qty-controls">
                    <button onClick={() => handleQuantityChange(p.id, -1)}>−</button>
                    <input
                      type="number"
                      value={p.quantity}
                      onChange={(e) => handleSetQuantity(p.id, e.target.value)}
                    />
                    <button onClick={() => handleQuantityChange(p.id, 1)}>+</button>
                    <button className="add5-btn" onClick={() => handleQuantityChange(p.id, 5)}>+5</button>
                  </div>
                </td>
                <td>
                  <span className={`badge ${p.outOfStock ? "badge-out" : "badge-in"}`}>
                    {p.outOfStock ? "Out of Stock" : "In Stock"}
                  </span>
                </td>
                <td>
                  <button className="toggle-btn" onClick={() => handleToggleStock(p.id, p.outOfStock)}>
                    Mark {p.outOfStock ? "In Stock" : "Out of Stock"}
                  </button>
                  <button className="delete-btn" onClick={() => handleDelete(p.id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </main>
    </div>
  );
}
