# ⚡ Quick Start - AnimeNotes

## 🚀 Get Running in 10 Minutes

### Step 1️⃣: MyAnimeList OAuth (3 min)
```
1. Visit: https://myanimelist.net/apiconfig
2. Click: "Create ID"
3. Fill Form:
   - App Name: AnimeNotes
   - Type: Web
   - Redirect: http://localhost:3000/api/auth/callback
4. Save: Client ID & Secret
```

### Step 2️⃣: Supabase Database (3 min)
```
1. Visit: https://supabase.com
2. Create project (choose region close to you)
3. Go to SQL Editor
4. Copy whole file: supabase/migrations/001_initial_schema.sql
5. Paste & run in SQL Editor
6. Get: URL, Anon Key, Service Key from settings
```

### Step 3️⃣: Environment Config (2 min)
```bash
# Edit .env.local with your values:
NEXT_PUBLIC_MAL_CLIENT_ID=xxx
MAL_CLIENT_SECRET=xxx
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxx
SUPABASE_SERVICE_ROLE_KEY=xxx
```

### Step 4️⃣: Install & Run (2 min)
```bash
npm install
npm run dev
```

Visit: **http://localhost:3000** → Click "Login with MyAnimeList"

---

## 📁 What You Get

| File | Description |
|------|-------------|
| **27 TS/TSX files** | React components, pages, API routes |
| **6 Library files** | OAuth, Database, API clients |
| **3 Custom hooks** | State management |
| **4 Docs** | Setup, API, Architecture, Summary |
| **1 Database** | PostgreSQL schema with RLS |

---

## ✨ Features Ready

✅ OAuth2 Login  
✅ Anime List Sync  
✅ Episode Notes  
✅ Database Secure  
✅ TypeScript  
✅ Tailwind CSS  

---

## 📚 Documentation

| File | When to Read |
|------|--------------|
| **README.md** | Project overview |
| **SETUP.md** | Step-by-step setup |
| **API.md** | API reference |
| **ARCHITECTURE.md** | System design |
| **PROJECT_SUMMARY.md** | Full checklist |

---

## 🚀 Deploy to Vercel

```bash
git push origin main
# (on Vercel dashboard)
1. Import repo
2. Add env variables
3. Deploy!
```

---

## 💡 Key Files

```
src/
├── app/api/auth/    → Login/Logout
├── app/api/anime/   → Anime data
├── lib/oauth.ts     → OAuth logic
├── lib/db.ts        → Database CRUD
└── hooks/           → State management
```

---

## ❓ Questions?

Check **SETUP.md** troubleshooting section!

---

**Ready to code? Start with `npm run dev` 🎬**
