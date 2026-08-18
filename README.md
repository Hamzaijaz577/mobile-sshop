# 📱 Mobile Store — React + Node.js

Full-stack mobile products website jisme backend admin dashboard se stock manage kiya ja sakta hai
(out of stock mark karna, quantity increase/decrease karna, naye products add karna).

## Project Structure
```
mobile-store/
├── backend/          # Node.js + Express API
│   ├── index.js       # Server & routes
│   └── data.json       # Product database (JSON file)
└── frontend/         # React (Vite) app
    └── src/
        ├── pages/
        │   ├── Home.jsx        # Customer-facing product listing
        │   ├── AdminLogin.jsx  # Admin login page
        │   └── Dashboard.jsx   # Admin dashboard (stock management)
        └── api.js     # API calls to backend
```

## Kaise Chalayein (How to Run)

### 1) Backend start karein
```bash
cd backend
npm install
node index.js
```
Backend `http://localhost:5000` par chalega.
Default admin key: **admin123** (ise `backend/index.js` mein `ADMIN_KEY` variable se change kar sakte hain,
ya environment variable `ADMIN_KEY` set karke).

### 2) Frontend start karein (naya terminal mein)
```bash
cd frontend
npm install
npm run dev
```
Frontend `http://localhost:5173` par chalega.

### 3) Website use karein
- **Customer view**: `http://localhost:5173/` — sab mobile products dikhenge, out-of-stock wale gray/disabled honge.
- **Admin Dashboard**: `http://localhost:5173/admin` — login karein (key: `admin123`), phir:
  - Quantity `+` / `−` buttons se badhayein/ghatayein
  - `+5` button se jaldi stock badhayein
  - Quantity box mein direct number type karke set karein
  - "Mark Out of Stock" / "Mark In Stock" button se status toggle karein
  - Naya product add karein ya purana delete karein

## API Endpoints (Backend)

### Public (Customer)
- `GET /api/products` — sab products
- `GET /api/products/:id` — ek product

### Admin (Header required: `x-admin-key: admin123`)
- `POST /api/admin/login` — login check
- `GET /api/admin/products` — sab products (protected)
- `POST /api/admin/products` — naya product add
- `PATCH /api/admin/products/:id/quantity` — quantity change (`{ "change": 5 }` ya `{ "change": -2 }`)
- `PATCH /api/admin/products/:id/set-quantity` — quantity direct set (`{ "quantity": 20 }`)
- `PATCH /api/admin/products/:id/stock-status` — out-of-stock set karein (`{ "outOfStock": true }`)
- `PUT /api/admin/products/:id` — product details update
- `DELETE /api/admin/products/:id` — product delete

## Aage Improve Kar Sakte Hain
- JSON file ki jagah real database (MongoDB/PostgreSQL) use karein production ke liye
- JWT-based proper authentication (abhi simple header-key auth hai)
- Product images upload feature (abhi URL use hota hai)
- Cart aur checkout flow
- Deploy: Backend Render/Railway par, Frontend Vercel/Netlify par
