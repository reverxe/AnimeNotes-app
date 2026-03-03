# Project Structure and Architecture

## Directory Tree

```
anime-notes-app/
│
├── src/
│   ├── app/                              # Next.js App Router
│   │   ├── api/                          # Backend API Routes
│   │   │   ├── auth/
│   │   │   │   ├── login/route.ts        # OAuth2 authorization URL
│   │   │   │   ├── callback/route.ts     # OAuth2 callback handler
│   │   │   │   └── logout/route.ts       # Logout endpoint
│   │   │   ├── anime/
│   │   │   │   ├── list/route.ts         # Get user's anime list
│   │   │   │   └── [animeId]/
│   │   │   │       ├── route.ts          # Get anime details
│   │   │   │       └── notes/[episodeNumber]/route.ts
│   │   │   └── user/
│   │   │       ├── profile/route.ts      # Get user profile
│   │   │       └── notes/route.ts        # Get all user notes
│   │   │
│   │   ├── auth/
│   │   │   └── error/page.tsx            # Auth error page
│   │   │
│   │   ├── anime/
│   │   │   └── [animeId]/page.tsx        # Anime details page
│   │   │
│   │   ├── dashboard/page.tsx            # User dashboard
│   │   ├── layout.tsx                    # Root layout
│   │   ├── page.tsx                      # Home page
│   │   └── globals.css                   # Global styles
│   │
│   ├── components/                       # React Components
│   │   ├── LoginButton.tsx               # Login/Logout button
│   │   ├── AnimeList.tsx                 # Anime list grid
│   │   ├── EpisodeNotes.tsx              # Episode notes editor
│   │   └── ProtectedRoute.tsx            # Auth guard component
│   │
│   ├── hooks/                            # Custom React Hooks
│   │   ├── useAuth.ts                    # User authentication
│   │   ├── useAnimeList.ts               # Anime list management
│   │   └── useNotes.ts                   # Note management
│   │
│   ├── lib/                              # Utilities & Helpers
│   │   ├── auth.ts                       # Auth utilities (cookies, tokens)
│   │   ├── db.ts                         # Database access layer
│   │   ├── mal-api.ts                    # MyAnimeList API client
│   │   ├── oauth.ts                      # OAuth2 logic
│   │   ├── supabase.ts                   # Supabase client instances
│   │   └── tokenManager.ts               # Token refresh logic
│   │
│   └── types/index.ts                    # TypeScript type definitions
│
├── supabase/
│   └── migrations/
│       └── 001_initial_schema.sql        # Database schema
│
├── public/                               # Static assets (if needed)
│
├── .env.local                            # Environment variables (local)
├── .env.example                          # Environment variables template
├── .gitignore                            # Git ignore rules
├── package.json                          # Dependencies
├── tsconfig.json                         # TypeScript config
├── tailwind.config.js                    # Tailwind CSS config
├── postcss.config.js                     # PostCSS config
├── next.config.js                        # Next.js config
│
├── README.md                             # Main documentation
├── SETUP.md                              # Setup guide
├── API.md                                # API documentation
└── ARCHITECTURE.md                       # This file
```

---

## Component Architecture

### Authentication Flow

```
┌─────────────────┐
│  Home Page      │
│ (LoginButton)   │
└────────┬────────┘
         │ Click "Login with MyAnimeList"
         ▼
┌─────────────────────────────┐
│ GET /api/auth/login         │
│ Returns OAuth2 Auth URL     │
└────────┬────────────────────┘
         │ Redirect to MyAnimeList
         ▼
┌──────────────────────────┐
│ MyAnimeList OAuth Page   │
│ User authenticates       │
└────────┬─────────────────┘
         │ Redirect with code
         ▼
┌────────────────────────────────┐
│ GET /api/auth/callback         │
│ ┌──────────────────────────┐   │
│ │ Exchange code for tokens │   │
│ │ Fetch user info          │   │
│ │ Sync anime list          │   │
│ │ Create/Update user       │   │
│ │ Set auth cookie          │   │
│ └──────────────────────────┘   │
└────────┬─────────────────────────┘
         │ Redirect to dashboard
         ▼
┌──────────────────┐
│ Dashboard Page   │
│ (Authenticated)  │
└──────────────────┘
```

### Page Structure

```
Home Page (Public)
│
├── Header (LoginButton)
│
├── Hero Section
│   ├── Heading
│   ├── Subheading
│   ├── CTA Buttons
│   └── Features Grid
│
└── Footer

Dashboard Page (Protected)
│
├── Header
│   ├── Logo
│   ├── Search (future)
│   └── LoginButton (shows username + logout)
│
├── Welcome Message
│   └── "Welcome, {username}!"
│
└── AnimeList
    ├── Sync Button
    ├── Anime Grid
    │   └── AnimeCard (clickable)
    │       ├── Picture
    │       ├── Title
    │       ├── Status
    │       ├── Episodes
    │       └── Score
    │
    └── Pagination
        ├── Previous Button
        ├── Page Info
        └── Next Button

Anime Detail Page (Protected)
│
├── Header
│   ├── Logo
│   └── LoginButton
│
├── Back Link
│
├── Main Grid (2 columns)
│
├── Sidebar (300px)
│   ├── Anime Picture (large)
│   └── Info Card
│       ├── Status
│       ├── Episodes
│       ├── Score
│       └── Note Count
│
└── Main Content
    ├── Title & Synopsis
    │
    ├── Episode Selector
    │   └── Episode Buttons (grid)
    │       (Green = watched, Blue = selected)
    │
    └── EpisodeNotes Component
        ├── Episode Header
        ├── View Mode
        │   └── Note Content
        │
        ├── Edit Mode
        │   ├── Textarea
        │   ├── Character Counter
        │   └── Action Buttons
        │
        └── Metadata
            └── Last Updated
```

---

## Data Flow

### Authentication & Token Management

```
┌──────────────┐
│ User Login   │
└──────┬───────┘
       │
       ▼
┌──────────────────────────┐
│ OAuth2 Code Exchange     │
│ MAL returns tokens       │
└──────┬───────────────────┘
       │
       ▼
┌───────────────────────────────┐
│ Supabase INSERT/UPDATE users  │
│ Store:                        │
│ - access_token (encrypted)    │
│ - refresh_token (encrypted)   │
│ - token_expires_at            │
└──────┬────────────────────────┘
       │
       ▼
┌────────────────────┐
│ Set Auth Cookie    │
│ (HTTP-only)        │
└──────┬─────────────┘
       │
       ▼
┌─────────────────────┐
│ Redirect Dashboard  │
└─────────────────────┘

Token Refresh Flow:
┌──────────────────┐     ┌─────────────────────┐
│ API Request      │────▶│ Check Token Expiry  │
└──────────────────┘     │ (5-min buffer)      │
                         └──────┬──────────────┘
                                │
                    ┌───────────┴───────────┐
                    │                       │
              Valid ▼               Expired ▼
                    │            ┌──────────────────┐
                    │            │ Refresh Token    │
                    │            │ via MAL API      │
                    │            └────┬─────────────┘
                    │                 │
                    │            ┌────▼──────────────┐
                    │            │ Update DB with    │
                    │            │ new tokens        │
                    │            └────┬──────────────┘
                    │                 │
                    └────────┬────────┘
                             │
                        ▼────────┐
                    ┌─────────────────┐
                    │ Continue Request│
                    │ With Token      │
                    └─────────────────┘
```

### Data Synchronization

```
User Login
    │
    ▼
Fetch Full Anime List from MAL API
    │
    ├─ Fetch episodes 0-100
    ├─ Fetch episodes 100-200
    ├─ ... (continue until no more)
    │
    ▼
Upsert to anime_list table
    │
    ├─ Update episodes watched
    ├─ Update scores
    ├─ Update status
    │
    ▼
Cache stored in Supabase
    │
Auto-refresh every 1 hour OR on demand
```

---

## Security Architecture

### Token Security

```
┌─────────────────────────────────────────────────────────┐
│ OAuth2 Authorization Code Flow                          │
├─────────────────────────────────────────────────────────┤
│                                                         │
│ 1. Frontend initiates login                            │
│    └─ No tokens exposed to frontend                    │
│                                                         │
│ 2. User authorizes on MyAnimeList                      │
│    └─ Secure authorization code obtained              │
│                                                         │
│ 3. Backend exchanges code for tokens                   │
│    └─ Token exchange done server-to-server             │
│    └─ Client secretly never sees tokens                │
│                                                         │
│ 4. Tokens stored in Supabase                           │
│    └─ Encrypted at rest                                │
│    └─ Only accessible via RLS policies                 │
│                                                         │
│ 5. Auth state via secure HTTP-only cookie              │
│    └─ Cannot be accessed via JavaScript                │
│    └─ Only sent over HTTPS                             │
│    └─ SameSite=Lax prevents CSRF                        │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### Database Security (RLS)

```
┌──────────────────────────────────────────────────────┐
│ Row Level Security (RLS) Policies                    │
├──────────────────────────────────────────────────────┤
│                                                      │
│ Users Table:                                         │
│ └─ Users can only view/update THEIR OWN profile     │
│                                                      │
│ Anime List Table:                                    │
│ └─ Users can only view/edit THEIR OWN anime list    │
│                                                      │
│ Notes Table:                                         │
│ └─ Users can only view/edit/delete THEIR OWN notes  │
│                                                      │
│ All policies checked at DB level (no bypass)         │
│                                                      │
└──────────────────────────────────────────────────────┘
```

---

## State Management

### Client-Side State (Hooks)

```
useAuth()
├─ user: UserProfile | null
├─ isAuthenticated: boolean
├─ loading: boolean
├─ error: string | null
├─ login(): Promise<void>
├─ logout(): Promise<void>
└─ refetch(): Promise<void>

useAnimeList()
├─ anime: AnimeListItem[]
├─ totalCount: number
├─ currentPage: number
├─ pageSize: number
├─ hasMore: boolean
├─ loading: boolean
├─ error: string | null
├─ fetchAnimeList(page, sync): Promise<void>
├─ nextPage(): Promise<void>
├─ previousPage(): Promise<void>
└─ setPageSize(size): void

useNotes()
├─ note: AnimeNote | null
├─ loading: boolean
├─ saving: boolean
├─ error: string | null
├─ fetchNote(animeId, episode): Promise<void>
├─ saveNote(...): Promise<void>
├─ deleteNote(...): Promise<void>
└─ clearError(): void
```

---

## Database Schema

### users
```
┌────────────────────────┐
│ users                  │
├────────────────────────┤
│ id (UUID, PK)          │
│ mal_user_id (INT, U)   │
│ mal_username (VARCHAR) │
│ email (VARCHAR)        │
│ access_token (VARCHAR) │
│ refresh_token (VARCHAR)│
│ token_expires_at (TS)  │
│ last_synced_at (TS)    │
│ created_at (TS)        │
│ updated_at (TS)        │
└────────────────────────┘
```

### anime_list
```
┌──────────────────────────┐
│ anime_list               │
├──────────────────────────┤
│ id (UUID, PK)            │
│ user_id (FK → users)     │
│ anime_id (INT)           │
│ title (VARCHAR)          │
│ status (VARCHAR)         │
│ score (INT)              │
│ num_episodes_watched (INT)
│ num_episodes (INT)       │
│ synopsis (TEXT)          │
│ mal_picture_small (VARCHAR)
│ mal_picture_large (VARCHAR)
│ created_at (TS)          │
│ updated_at (TS)          │
│ UNIQUE(user_id, anime_id)│
└──────────────────────────┘
```

### notes
```
┌─────────────────────────┐
│ notes                   │
├─────────────────────────┤
│ id (UUID, PK)           │
│ user_id (FK → users)    │
│ anime_id (INT)          │
│ episode_number (INT)    │
│ content (TEXT, <5000)   │
│ created_at (TS)         │
│ updated_at (TS)         │
│ UNIQUE(user_id, anime_id,
│         episode_number) │
└─────────────────────────┘
```

---

## Environment Variables

### Required for Development
```
NEXT_PUBLIC_MAL_CLIENT_ID           # MyAnimeList OAuth
MAL_CLIENT_SECRET                   # MyAnimeList OAuth
NEXT_PUBLIC_MAL_REDIRECT_URI        # OAuth callback URL
NEXT_PUBLIC_SUPABASE_URL            # Supabase project
NEXT_PUBLIC_SUPABASE_ANON_KEY       # Supabase auth
SUPABASE_SERVICE_ROLE_KEY           # Supabase admin
NEXT_PUBLIC_APP_URL                 # App URL
```

---

## Performance Considerations

1. **Database Queries**
   - Indexed on frequently queried columns
   - Paginated responses (max 100 per page)
   - Efficient RLS policies

2. **API Caching**
   - Anime list cached locally after sync
   - Auto-refresh every 1 hour
   - Manual refresh available

3. **Token Management**
   - Refresh 5 minutes before expiration
   - Prevents unnecessary re-authentication

4. **Image Optimization**
   - Next.js Image component for lazy loading
   - Multiple picture sizes from MAL API

---

## Scalability

This architecture can scale to:
- Thousands of concurrent users (Vercel auto-scaling)
- Millions of notes (Supabase PostgreSQL)
- High-frequency data access (RLS + indexing)

---

## Future Architecture Considerations

- [ ] Add caching layer (Redis)
- [ ] Implement webhook sync for real-time updates
- [ ] Add analytics/metrics dashboard
- [ ] Multi-language support
- [ ] Mobile app (React Native sharing core logic)
