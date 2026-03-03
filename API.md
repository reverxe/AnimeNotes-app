# API Documentation - MyAnimeNote

## Overview

All API endpoints require authentication (except login). Authentication is done via JWT token in HTTP-only cookies.

### Base URL
- Local: `http://localhost:3000/api`
- Production: `https://your-app.vercel.app/api`

---

## Authentication Endpoints

### Login
**GET** `/auth/login`

Get the MyAnimeList OAuth2 authorization URL.

**Response:**
```json
{
  "success": true,
  "authUrl": "https://myanimelist.net/v1/oauth2/authorize?..."
}
```

**Usage:**
```javascript
const response = await fetch('/api/auth/login');
const { authUrl } = await response.json();
window.location.href = authUrl;
```

---

### OAuth2 Callback
**GET** `/auth/callback?code=...&state=...`

Handles the OAuth2 callback from MyAnimeList. Automatically called by MyAnimeList after user authorization.

**Query Parameters:**
- `code` (string) - Authorization code from MyAnimeList
- `state` (string) - State parameter for security

**Response:**
- Redirects to `/dashboard` on success
- Redirects to `/auth/error?error=...` on failure
- Sets HTTP-only auth cookie

---

### Logout
**POST** `/auth/logout`

Logout the current user and clear authentication.

**Headers:**
```
Content-Type: application/json
```

**Response:**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

**Usage:**
```javascript
await fetch('/api/auth/logout', {
  method: 'POST'
});
window.location.href = '/';
```

---

## User Endpoints

### Get Profile
**GET** `/user/profile`

Get the current user's profile.

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid-here",
    "mal_user_id": 12345,
    "mal_username": "username",
    "email": "user@example.com",
    "created_at": "2024-03-03T00:00:00Z",
    "updated_at": "2024-03-03T00:00:00Z"
  }
}
```

---

### Get All Notes
**GET** `/user/notes?limit=50&offset=0`

Get all notes created by the current user (paginated).

**Query Parameters:**
- `limit` (number, optional) - Results per page, max 100. Default: 50
- `offset` (number, optional) - Start position. Default: 0

**Response:**
```json
{
  "success": true,
  "data": {
    "data": [
      {
        "id": "uuid",
        "user_id": "uuid",
        "anime_id": 1234,
        "episode_number": 5,
        "content": "Great episode!",
        "created_at": "2024-03-03T00:00:00Z",
        "updated_at": "2024-03-03T00:00:00Z"
      }
    ],
    "pagination": {
      "limit": 50,
      "offset": 0,
      "total": 150,
      "hasMore": true
    }
  }
}
```

---

## Anime Endpoints

### Get Anime List
**GET** `/anime/list?limit=50&offset=0&sync=false`

Get user's anime list from database (optionally sync with MyAnimeList first).

**Query Parameters:**
- `limit` (number, optional) - Results per page, max 100. Default: 50
- `offset` (number, optional) - Start position. Default: 0
- `sync` (boolean, optional) - Sync with MyAnimeList before returning. Default: false

**Response:**
```json
{
  "success": true,
  "data": {
    "data": [
      {
        "id": "uuid",
        "anime_id": 1234,
        "title": "Anime Title",
        "status": "watching",
        "score": 9,
        "num_episodes_watched": 12,
        "num_episodes": 24,
        "mal_picture_large": "https://...",
        "mal_picture_small": "https://..."
      }
    ],
    "pagination": {
      "limit": 50,
      "offset": 0,
      "total": 85,
      "hasMore": true
    }
  }
}
```

**Auto Sync Behavior:**
- Automatically syncs if last sync was > 1 hour ago
- Manual sync available with `sync=true` parameter

---

### Get Anime Details
**GET** `/anime/[animeId]`

Get detailed information about a specific anime from user's list.

**Path Parameters:**
- `animeId` (number) - MyAnimeList anime ID

**Response:**
```json
{
  "success": true,
  "data": {
    "anime": {
      "id": "uuid",
      "anime_id": 1234,
      "title": "Anime Title",
      "status": "watching",
      "score": 9,
      "num_episodes_watched": 12,
      "num_episodes": 24,
      "synopsis": "...",
      "mal_picture_large": "https://..."
    },
    "details": {
      "id": 1234,
      "title": "Anime Title",
      "synopsis": "Full synopsis...",
      "num_episodes": 24,
      "status": "finished_airing",
      "aired": {
        "from": "2023-01-01",
        "to": "2023-03-31"
      },
      "genres": [
        { "id": 1, "name": "Action" }
      ]
    },
    "stats": {
      "status": "finished_airing",
      "num_list_users": 123456
    },
    "notes": [
      {
        "id": "uuid",
        "episode_number": 1,
        "content": "Great opening!",
        "created_at": "2024-03-03T00:00:00Z"
      }
    ],
    "noteCount": 12
  }
}
```

**Errors:**
- `401` - Not authenticated
- `404` - Anime not in user's list
- `400` - Invalid anime ID

---

## Note Endpoints

### Get Episode Note
**GET** `/anime/[animeId]/notes/[episodeNumber]`

Get the personal note for a specific episode.

**Path Parameters:**
- `animeId` (number) - MyAnimeList anime ID
- `episodeNumber` (number) - Episode number (1-indexed)

**Response:**
```json
{
  "success": true,
  "data": {
    "note": {
      "id": "uuid",
      "user_id": "uuid",
      "anime_id": 1234,
      "episode_number": 5,
      "content": "Amazing episode with great plot twist!",
      "created_at": "2024-03-03T10:00:00Z",
      "updated_at": "2024-03-03T15:30:00Z"
    }
  }
}
```

**Returns `null` if no note exists:**
```json
{
  "success": true,
  "data": {
    "note": null
  }
}
```

---

### Create/Update Episode Note
**POST** `/anime/[animeId]/notes/[episodeNumber]`

Create a new note or update an existing one for an episode.

**Path Parameters:**
- `animeId` (number) - MyAnimeList anime ID
- `episodeNumber` (number) - Episode number (1-indexed)

**Request Body:**
```json
{
  "content": "My thoughts about this episode..."
}
```

**Validation:**
- `content` required, non-empty string
- Max 5000 characters
- Whitespace is trimmed

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "user_id": "uuid",
    "anime_id": 1234,
    "episode_number": 5,
    "content": "My thoughts about this episode...",
    "created_at": "2024-03-03T10:00:00Z",
    "updated_at": "2024-03-03T10:00:00Z"
  }
}
```

**Errors:**
- `400` - Content is required or exceeds 5000 characters
- `401` - Not authenticated
- `500` - Server error

---

### Delete Episode Note
**DELETE** `/anime/[animeId]/notes/[episodeNumber]`

Delete a personal note for an episode.

**Path Parameters:**
- `animeId` (number) - MyAnimeList anime ID
- `episodeNumber` (number) - Episode number (1-indexed)

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "message": "Note deleted successfully"
  }
}
```

**Errors:**
- `401` - Not authenticated
- `404` - Note not found
- `500` - Server error

---

## Error Responses

All errors follow this format:

```json
{
  "success": false,
  "error": "Error message describing what went wrong"
}
```

### Common Status Codes

- `200` - OK
- `201` - Created
- `400` - Bad Request (validation error)
- `401` - Unauthorized (not authenticated)
- `404` - Not Found
- `429` - Too Many Requests (rate limited)
- `500` - Internal Server Error

---

## Rate Limiting

Sensitive endpoints have rate limiting per IP:

- `/auth/login` - 20 requests per minute
- `/auth/callback` - 30 requests per minute

Returns `429 Too Many Requests` when exceeded.

---

## Authentication

All endpoints except login require an active session. Authentication is via:

1. **HTTP-only Cookie** - Auth token automatically set after successful login
2. **Secure Communication** - HTTPS required in production
3. **Session Expiration** - Sessions expire after 7 days of inactivity

### Checking Authentication

```javascript
// This hook is available in React components
const { isAuthenticated } = useAuth();

if (!isAuthenticated) {
  // Redirect to login or show login button
}
```

---

## Token Management

- Tokens are automatically refreshed when expired
- Refresh happens 5 minutes before expiration
- No manual token handling needed - all transparent

---

## Usage Examples

### Login Flow
```javascript
// 1. Get login URL
const loginRes = await fetch('/api/auth/login');
const { authUrl } = await loginRes.json();

// 2. Redirect user
window.location.href = authUrl;

// 3. MAL redirects back to /api/auth/callback
// 4. Backend handles OAuth exchange
// 5. User redirected to /dashboard
```

### Fetch Anime List
```javascript
const response = await fetch('/api/anime/list?sync=true');
const { data } = await response.json();
console.log(data.data); // Array of anime
```

### Create Note
```javascript
await fetch('/api/anime/1234/notes/5', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    content: 'Great episode!'
  })
});
```

### Update Note
```javascript
await fetch('/api/anime/1234/notes/5', {
  method: 'POST', // or PUT
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    content: 'Updated thoughts...'
  })
});
```

### Delete Note
```javascript
await fetch('/api/anime/1234/notes/5', {
  method: 'DELETE'
});
```

---

## CORS Policy

The API is configured for same-origin requests. Cross-origin requests should go through this Next.js application (not direct to the API).

---

## Support

For API issues, check:
1. Browser console for detailed error messages
2. Application logs in Vercel dashboard
3. Supabase error logs
4. MyAnimeList API status page
