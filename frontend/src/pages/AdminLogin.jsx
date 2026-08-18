import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { adminLogin } from "../api";

export default function AdminLogin() {
  const [key, setKey] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const result = await adminLogin(key);
      if (result.success) {
        localStorage.setItem("adminKey", key);
        navigate("/admin/dashboard");
      } else {
        setError(result.message || "Login failed");
      }
    } catch {
      setError("Server se connect nahi ho saka.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-page">
      <form className="login-box" onSubmit={handleSubmit}>
        <h2>Admin Login</h2>
        <p className="hint">Default key: <code>admin123</code></p>
        <input
          type="password"
          placeholder="Enter admin key"
          value={key}
          onChange={(e) => setKey(e.target.value)}
          required
        />
        {error && <p className="error">{error}</p>}
        <button type="submit" disabled={loading}>
          {loading ? "Checking..." : "Login"}
        </button>
        <Link to="/" className="back-link">← Back to store</Link>
      </form>
    </div>
  );
}
