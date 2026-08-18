import { useEffect, useState } from "react";
import { getProducts } from "../api";

export default function Home() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    getProducts()
      .then(setProducts)
      .catch(() => setError("Products load nahi ho sake. Backend chalu hai?"))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <header className="header">
        <h1>📱 Mobile Store</h1>
      </header>

      <main className="container">
        {loading && <p className="status-msg">Loading products...</p>}
        {error && <p className="status-msg error">{error}</p>}

        <div className="product-grid">
          {products.map((p) => (
            <div key={p.id} className={`product-card ${p.outOfStock ? "out-of-stock" : ""}`}>
              <img src={p.image} alt={p.name} />
              <div className="product-info">
                <span className="brand">{p.brand}</span>
                <h3>{p.name}</h3>
                <p className="desc">{p.description}</p>
                <div className="price-row">
                  <span className="price">Rs. {p.price.toLocaleString()}</span>
                  {p.outOfStock ? (
                    <span className="badge badge-out">Out of Stock</span>
                  ) : (
                    <span className="badge badge-in">In Stock ({p.quantity})</span>
                  )}
                </div>
                <button disabled={p.outOfStock} className="buy-btn">
                  {p.outOfStock ? "Not Available" : "Buy Now"}
                </button>
              </div>
            </div>
          ))}
        </div>

        {!loading && !error && products.length === 0 && (
          <p className="status-msg">Koi product available nahi hai.</p>
        )}
      </main>
    </div>
  );
}
