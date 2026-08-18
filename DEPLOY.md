# 🚀 Deployment Guide — Vercel + Render

Aapki website 2 hisson mein deploy hogi:
- **Frontend (React)** → Vercel par
- **Backend (Node/Express API)** → Render par

Vercel khud sirf static/frontend apps ke liye best hai. Backend jo file (`data.json`) mein data likhta/badalta hai,
usko Render jaisi jagah chahiye jahan server hamesha chalta rahe (Vercel serverless mein file-writes save nahi
rehte, is liye ye split zaroori hai).

---

## Step 1: GitHub par code push karein

1. [github.com](https://github.com) par naya repository banayein (e.g. `mobile-store`)
2. Apne project folder mein terminal khol kar:
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

## Step 2: Backend deploy karein (Render.com)

1. [render.com](https://render.com) par free account banayein (GitHub se sign in karein)
2. Dashboard mein **"New +" → "Web Service"** click karein
3. Apna GitHub repo select karein
4. Ye settings bharein:
   - **Root Directory**: `backend`
   - **Runtime**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `node index.js`
   - **Instance Type**: Free
5. **Environment Variables** mein add karein (optional lekin recommended):
   - `ADMIN_KEY` = apni pasand ki admin key (default `admin123` hai)
6. **"Create Web Service"** click karein — Render aapko ek URL dega jaisे:
   ```
   https://mobile-store-backend.onrender.com
   ```
   Ye URL save kar lein, agle step mein chahiye hoga.

> ⚠️ Free tier Render service kuch der inactive rehne par "sleep" ho jati hai —
> pehli request par 30-60 second lag sakte hain jagne mein. Ye normal hai.

---

## Step 3: Frontend deploy karein (Vercel)

1. [vercel.com](https://vercel.com) par free account banayein (GitHub se sign in karein)
2. **"Add New" → "Project"** click karein
3. Apna GitHub repo import karein
4. Ye settings set karein:
   - **Root Directory**: `frontend`
   - **Framework Preset**: Vite (auto-detect ho jayega)
   - **Build Command**: `npm run build` (default)
   - **Output Directory**: `dist` (default)
5. **Environment Variables** mein add karein:
   - Key: `VITE_API_URL`
   - Value: `https://mobile-store-backend.onrender.com/api`
     (Step 2 wala backend URL + `/api`)
6. **"Deploy"** click karein

2-3 minute mein aapki website live ho jayegi, jaise:
```
https://mobile-store-yourname.vercel.app
```

---

## Step 4: Backend ko frontend allow karayein (CORS)

Render dashboard mein backend service khol kar **Environment Variables** mein ye add karein:
- Key: `FRONTEND_URL`
- Value: `https://mobile-store-yourname.vercel.app` (aapka asli Vercel URL)

Save karne ke baad Render service khud restart ho jayegi.

---

## Ab Test Karein

- Website: `https://mobile-store-yourname.vercel.app` → products dikhne chahiye
- Admin panel: `https://mobile-store-yourname.vercel.app/admin` → login key se dashboard khulega

---

## Quick Alternative: Sirf Frontend Vercel CLI se (GitHub ke bina)

Agar sirf frontend jaldi test karna hai (backend abhi localhost par hi chale):
```powershell
cd frontend
npm install -g vercel
vercel
```
Terminal mein sawalon ka jawab de dein — chand second mein live link mil jayega.
Lekin is case mein backend bhi deploy karna hoga taake admin dashboard aur products
sab jagah se kaam karein (localhost sirf aapke apne computer tak mehdood hai).
