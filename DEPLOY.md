# 🚀 Deployment Guide — Sab kuch Vercel par (Frontend + Backend)

Backend ab MongoDB Atlas (free database) use karta hai, is liye ye Vercel serverless
par bhi sahi kaam karega (pehle wala `data.json` file-based version Vercel par
data save nahi rakhta tha).

Frontend aur backend do alag Vercel projects ke roop mein deploy honge (dono
Vercel par hi honge, bas alag-alag project — ye normal aur recommended tareeqa hai).

---

## Step 0: MongoDB Atlas (free database) setup

1. [mongodb.com/cloud/atlas/register](https://mongodb.com/cloud/atlas/register) par free account banayein
2. "Build a Database" → **M0 (FREE)** plan select karein → Create
3. Database user banayein (username + password) — save kar lein
4. Network Access mein "Allow Access from Anywhere" (0.0.0.0/0) add karein
5. "Connect" → "Drivers" → Node.js se connection string copy karein, jaise:
   ```
   mongodb+srv://admin:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
   `<password>` ki jagah apna asli password dal dein

### Data seed karein (ek baar)
Apne computer par:
```bash
cd backend
npm install
cp .env.example .env
# .env file kholein aur MONGODB_URI mein apni connection string paste karein
npm run seed
```
Ye starter products (`data.json` wale 4 phones) database mein daal dega.

---

## Step 1: GitHub par code push karein

```powershell
cd C:\Users\AS\Downloads\mobile-store
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/mobile-store.git
git push -u origin main
```

---

## Step 2: Backend deploy karein (Vercel)

1. [vercel.com](https://vercel.com) par GitHub se sign in karein
2. **"Add New" → "Project"** → apna repo import karein
3. Settings:
   - **Root Directory**: `backend`
   - **Framework Preset**: Other
   - Build/Output settings default rehne dein (backend mein build step nahi chahiye)
4. **Environment Variables** add karein:
   - `MONGODB_URI` = apni Atlas connection string
   - `MONGODB_DB` = `mobile_store`
   - `ADMIN_KEY` = apni pasand ki admin key (default `admin123`)
5. **Deploy** click karein — URL milega jaise:
   ```
   https://mobile-store-backend.vercel.app
   ```
   Ye save kar lein.

---

## Step 3: Frontend deploy karein (Vercel — naya project)

1. Vercel par phir **"Add New" → "Project"** → **wahi repo dubara import karein**
   (Vercel ek hi repo se multiple projects banane deta hai)
2. Settings:
   - **Root Directory**: `frontend`
   - **Framework Preset**: Vite (auto-detect)
3. **Environment Variables**:
   - `VITE_API_URL` = `https://mobile-store-backend.vercel.app/api`
     (Step 2 wala URL + `/api`)
4. **Deploy** click karein

2-3 minute mein live ho jayega:
```
https://mobile-store-yourname.vercel.app
```

---

## Step 4: Backend ko frontend allow karayein (CORS)

Backend project (Vercel dashboard → Settings → Environment Variables) mein add/update karein:
- `FRONTEND_URL` = `https://mobile-store-yourname.vercel.app` (asli Vercel frontend URL)

Save karne ke baad backend project ko **Redeploy** karein (Deployments tab → latest → "..." → Redeploy).

---

## Test Karein

- Website: `https://mobile-store-yourname.vercel.app` → products dikhne chahiye
- Admin panel: `.../admin` → login key se dashboard khulega, stock update karke
  refresh karein — ab changes **permanently save** rahenge (MongoDB mein).

---

## Local development (dono ek saath chalane ke liye)

```bash
# Terminal 1
cd backend
npm install
cp .env.example .env   # MONGODB_URI daal dein
npm run dev             # http://localhost:5000

# Terminal 2
cd frontend
npm install
npm run dev              # http://localhost:5173
```
