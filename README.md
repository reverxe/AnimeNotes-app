# AnimeNotes - Personal Anime Tracker with MyAnimeList Integration

A modern web application that lets you connect your MyAnimeList profile via OAuth2, sync your anime list, and write personalized episode-by-episode notes.

## Features

- **Secure OAuth2 Authentication** - Safe login with MyAnimeList (Authorization Code Flow)
- **Auto Sync** - Automatically synchronize your anime list from MyAnimeList
- **Episode Notes** - Write detailed personal notes for every episode
- **Private Database** - All notes stored safely in your personal Supabase database
- **Responsive Design** - Works on desktop, tablet, and mobile
- **Production Ready** - Clean, scalable architecture suitable for portfolio

## Tech Stack

- **Frontend Framework**: Next.js 14+ with TypeScript
- **Styling**: Tailwind CSS
- **Database**: Supabase (PostgreSQL)
- **Authentication**: MyAnimeList OAuth2
- **Hosting**: Vercel (recommended)
- **HTTP Client**: Axios

## Getting Started

### 1. Prerequisites

- Node.js 18+ and npm/pnpm
- MyAnimeList account
- Supabase account (free tier available)

### 2. Setup MyAnimeList OAuth2

1. Go to [MyAnimeList API Settings](https://myanimelist.net/apiconfig)
2. Create a new OAuth2 application:
   - **App Name**: AnimeNotes
   - **App Type**: Web
   - **Redirect URI**: `http://localhost:3000/api/auth/callback`
3. Copy your **Client ID** and **Client Secret**

### 3. Setup Supabase Database

1. Create a new Supabase project at [supabase.com](https://supabase.com)
2. In the SQL Editor, run the migration from `supabase/migrations/001_initial_schema.sql`
3. Copy your **Project URL** and **Anon Key**

### 4. Install Dependencies & Set Environment Variables

```bash
npm install
```

Edit `.env.local`:
```env
NEXT_PUBLIC_MAL_CLIENT_ID=your_client_id
MAL_CLIENT_SECRET=your_client_secret
NEXT_PUBLIC_MAL_REDIRECT_URI=http://localhost:3000/api/auth/callback
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_key
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 5. Run Development Server

```bash
npm run dev
```

Visit `http://localhost:3000` and test the login flow!

## Project Structure

```
src/
├── app/api/          # API routes (backend)
│   ├── auth/         # OAuth2 authentication
│   ├── anime/        # Anime list and details
│   └── user/         # User profile and notes
├── app/              # Pages
├── components/       # React components
├── hooks/            # Custom React hooks
├── lib/              # Utilities and helpers
├── types/            # TypeScript types
└── globals.css       # Global styles
```

## Security Features

- OAuth2 Authorization Code Flow
- Secure token storage in Supabase
- HTTP-only cookies
- Row Level Security policies
- Rate limiting on sensitive endpoints
- No password storage - OAuth2 only

## API Endpoints

### Authentication
- `GET /api/auth/login` - Get authorization URL
- `GET /api/auth/callback` - OAuth2 callback
- `POST /api/auth/logout` - Logout user

### Anime Data
- `GET /api/anime/list` - Get user's anime list
- `GET /api/anime/[id]` - Get anime details

### Notes
- `GET /api/anime/[id]/notes/[episode]` - Get episode note
- `POST /api/anime/[id]/notes/[episode]` - Create/update note
- `DELETE /api/anime/[id]/notes/[episode]` - Delete note

### User
- `GET /api/user/profile` - Get user profile
- `GET /api/user/notes` - Get all notes

## Database Schema

### users
- id (UUID, primary key)
- mal_user_id (integer, unique)
- mal_username (string)
- access_token (encrypted)
- refresh_token (encrypted)
- token_expires_at (timestamp)
- last_synced_at (timestamp)

### anime_list
- id (UUID, primary key)
- user_id (foreign key)
- anime_id (integer)
- title (string)
- status (string)
- score (integer)
- episodes (watched/total)

### notes
- id (UUID, primary key)
- user_id (foreign key)
- anime_id (integer)
- episode_number (integer)
- content (text, max 5000 chars)
- timestamps

## Deployment to Vercel

```bash
git push origin main
```

Set environment variables in Vercel dashboard, update MAL OAuth redirect URI, and deploy!

## Development Tips

- Tokens auto-refresh 5 minutes before expiration
- Anime list syncs every 1 hour or on manual trigger
- All notes are private and stored only in your database
- Check browser console for API errors during development

## Troubleshooting

**OAuth Error: Invalid redirect URI**
- Ensure redirect URI matches MyAnimeList settings exactly

**Supabase Connection Error**
- Verify environment variables are correct
- Check that tables exist and RLS is configured

**Empty Anime List**
- Click "Sync" button in dashboard
- Ensure you have anime in your MyAnimeList account

## Architecture

### Clean Code Principles Applied
- Separation of concerns (API routes, database layer, components)
- Reusable hooks for state management
- Type-safe with TypeScript throughout
- Database access layer abstraction
- Utility functions for OAuth2 and token management

### OAuth2 Authorization Code Flow
1. User initiates login
2. Redirected to MyAnimeList authorization
3. MAL redirects back with authorization code
4. Backend exchanges code for tokens
5. Tokens stored securely in database
6. User authenticated and dashboard loads

## Future Enhancements

- Anime statistics dashboard
- Tag system for notes
- Full-text search
- Export notes as PDF
- Dark mode
- Mobile app

## License

MIT - Use in your portfolio!

## Support

For issues: create a GitHub issue with details

---

**Track your anime with personalized episode notes! 📺✍️**
