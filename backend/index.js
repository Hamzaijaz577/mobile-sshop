// Local development entrypoint (not used on Vercel — Vercel uses api/index.js)
require("dotenv").config();
const app = require("./app");

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Backend server running at http://localhost:${PORT}`);
  console.log(`Admin key: ${process.env.ADMIN_KEY || "admin123"}`);
});
