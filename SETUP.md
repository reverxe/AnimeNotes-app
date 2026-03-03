# Setup Guide - AnimeNotes

## 🔐 Step 1: MyAnimeList OAuth2 Setup

### Create OAuth Application

1. Go to https://myanimelist.net/apiconfig
2. Click **"Create ID"** to create a new API application
3. Fill in the form:
   - **App Name**: AnimeNotes
   - **App Type**: Web (not mobile)
   - **Redirect URI**: `http://localhost:3000/api/auth/callback`
   - **Display Form**: No
4. Accept the terms and click **"Submit"**
5. You'll get:
   - **Client ID** (save this)
   - **Client Secret** (save this - keep it private!)

### Update for Production

When deploying to Vercel, create a new application or update the redirect URI:
- **Redirect URI**: `https://your-app.vercel.app/api/auth/callback`

---

## 🗄️ Step 2: Supabase Setup

### Create Supabase Project

1. Go to https://supabase.com
2. Sign up or login
3. Click **"New Project"**
4. Fill in:
   - **Name**: anime-notes
   - **Database Password**: (generate a strong password)
   - **Region**: Choose closest to you
5. Wait for project to initialize

### Get Your Credentials

In Project Settings → API:
- Copy **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
- Copy **Anon Public Key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Go to Service Role Keys and copy → `SUPABASE_SERVICE_ROLE_KEY`

### Initialize Database

1. Go to **SQL Editor** in Supabase dashboard
2. Click **"New Query"**
3. Copy the entire content from `supabase/migrations/001_initial_schema.sql`
4. Paste it into the SQL Editor
5. Click **"Run"**

The database tables will be created automatically!

---

## 📝 Step 3: Environment Variables

Create `.env.local` in the root directory:

```env
# MyAnimeList OAuth2
NEXT_PUBLIC_MAL_CLIENT_ID=your_client_id_here
MAL_CLIENT_SECRET=your_client_secret_here
NEXT_PUBLIC_MAL_REDIRECT_URI=http://localhost:3000/api/auth/callback

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development
```

**⚠️ Security Note**: Never commit `.env.local` to git!

---

## 🚀 Step 4: Local Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

Visit `http://localhost:3000`

### Test OAuth Flow

1. Click **"Login with MyAnimeList"**
2. You'll be redirected to MyAnimeList
3. Click **"Agree"** to authorize
4. You'll be redirected to the dashboard
5. Your anime list will begin syncing

---

## 📦 Step 5: Deployment to Vercel

### Push to GitHub

```bash
git add .
git commit -m "Initial commit: AnimeNotes app"
git push origin main
```

### Deploy to Vercel

1. Go to https://vercel.com
2. Click **"New Project"**
3. Import your GitHub repository
4. In **Environment Variables**, add:

```
NEXT_PUBLIC_MAL_CLIENT_ID=your_client_id
MAL_CLIENT_SECRET=your_client_secret
NEXT_PUBLIC_MAL_REDIRECT_URI=https://your-app.vercel.app/api/auth/callback
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_key
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
```

5. Click **"Deploy"**

### Update MyAnimeList OAuth Settings

1. Go back to https://myanimelist.net/apiconfig
2. Edit your application
3. Update **Redirect URI** to: `https://your-app.vercel.app/api/auth/callback`
4. Save changes

---

## 🧪 Testing Checklist

- [ ] Local development starts without errors
- [ ] OAuth login redirects to MyAnimeList
- [ ] After authorization, redirected to dashboard
- [ ] Anime list syncs and displays
- [ ] Can click on anime to view details
- [ ] Can create/edit/delete episode notes
- [ ] Logout works and clears session
- [ ] App deploys to Vercel successfully
- [ ] Production OAuth flow works

---

## 🐛 Troubleshooting

### "Invalid redirect URI" Error

**Problem**: OAuth returns redirect URI mismatch error
- Make sure `NEXT_PUBLIC_MAL_REDIRECT_URI` exactly matches MyAnimeList settings
- Include full path: `http://localhost:3000/api/auth/callback`

### "Cannot fetch anime list" Error

**Problem**: After login, anime list is empty or errors
- Click **"Sync"** button in dashboard
- Check browser console for API errors (F12 → Console)
- Verify MyAnimeList account has anime

### "Supabase connection failed" Error

**Problem**: Database connection issues
- Verify `NEXT_PUBLIC_SUPABASE_URL` is correct
- Check `NEXT_PUBLIC_SUPABASE_ANON_KEY` is correct
- Ensure database tables exist (run migration)
- Check Supabase dashboard for errors

### "(name) is not defined" TypeScript Error

**Problem**: TypeScript compilation errors
- Run `npm install` to ensure all dependencies
- Clear `.next/` cache: `rm -rf .next`
- Restart dev server: `npm run dev`

### Tokens Not Refreshing

**Problem**: Getting "token expired" errors
- Tokens auto-refresh 5 min before expiration
- Check `src/lib/tokenManager.ts` implementation
- Log out and log back in to reset tokens

---

## 📚 Useful Links

- [MyAnimeList API Docs](https://myanimelist.net/apiconfig/references/api/v2)
- [Supabase Documentation](https://supabase.com/docs)
- [Next.js Documentation](https://nextjs.org/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

---

## Questions?

Refer to the main **README.md** for architecture overview and project structure!
