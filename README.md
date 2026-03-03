# MyAnimeNote - Personal Anime Tracker with MyAnimeList Integration

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

## Getting Started / Avvio

### 1. Prerequisites / 1. Prerequisiti

**English:**
- Node.js 18+ and npm/pnpm
- MyAnimeList account
- Supabase account (free tier available)

**Italiano:**
- Node.js 18+ e npm/pnpm
- Account MyAnimeList
- Account Supabase (è disponibile il piano gratuito)

### 2. Setup MyAnimeList OAuth2 / Configurare OAuth2 su MyAnimeList

> **Nota**: durante lo sviluppo Next.js potrebbe avviare il server su una porta diversa da 3000 (ad esempio 3002) se la porta 3000 è già occupata. La nostra app ora costruisce il `redirect_uri` basandosi sull'host della richiesta, quindi il link generato sarà corretto anche se il numero di porta varia. Assicurati però che l'URI registrato nella dashboard MAL includa **tutte** le porte che potresti usare (3000, 3001, 3002, ecc.).

**English:**
1. Go to [MyAnimeList API Settings](https://myanimelist.net/apiconfig)
2. Create a new OAuth2 application:
   - **App Name**: MyAnimeNote
   - **App Type**: Web
   - **Redirect URI**: `http://localhost:3000/api/auth/callback` (or `http://localhost:3002/api/auth/callback` if your dev server picks another port)
   - You may add both URIs to the app settings so you don't have to reconfigure if the port changes
3. Copy your **Client ID** and **Client Secret**

**OR** if you don’t want to use OAuth at all, export your list from MAL in XML format (`My List → Export`), which downloads a GZIPped XML file. Then upload that file on the `/import` page.

**Italiano:**
1. Vai su [Impostazioni API di MyAnimeList](https://myanimelist.net/apiconfig)
2. Crea una nuova applicazione OAuth2:
   - **Nome App**: MyAnimeNote
   - **Tipo App**: Web
   - **Redirect URI**: `http://localhost:3000/api/auth/callback` (o `http://localhost:3002/api/auth/callback` se il server di sviluppo usa un'altra porta)
   - Puoi mettere **entrambe** le URIs nelle impostazioni dell’app così non dovrai ricambiare ogni volta che la porta cambia
3. Copia il tuo **Client ID** e il **Client Secret**

### 3. Setup Supabase Database / Configurare il database Supabase

**English:**
1. Create a new Supabase project at [supabase.com](https://supabase.com)
2. In the SQL Editor, run the migration from `supabase/migrations/001_initial_schema.sql`
3. Copy your **Project URL** and **Anon Key**

**Italiano:**
1. Crea un nuovo progetto Supabase su [supabase.com](https://supabase.com)
2. Nell'Editor SQL, esegui la migrazione presente in `supabase/migrations/001_initial_schema.sql`
3. Copia l'**URL del progetto** e la **Anon Key**

### 4. Install Dependencies & Set Environment Variables / Installare dipendenze e impostare le variabili d'ambiente

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

**Italiano:** modificare il file `.env.local` sostituendo i valori segnaposto con quelli ottenuti nei passaggi precedenti.

### 5. Run Development Server / Avviare il server di sviluppo

```bash
npm run dev
```

Visit `http://localhost:3000` and test the login flow!

**Italiano:** visita `http://localhost:3000` e prova a fare il login usando il pulsante. Il browser verrà reindirizzato a MyAnimeList per autorizzare l'app.

### 6. Testing the OAuth Flow / Testare il flusso OAuth

> **Alternative**: if you prefer not to use OAuth, you can now import your list manually via CSV. See the **Import section** below.


**English:**
1. Start the server (`npm run dev`) and open the application in your browser.
2. Click the **Login** button. This triggers `/api/auth/login` and will redirect you to MyAnimeList.
   - the server log will still print the generated URL and PKCE values for reference.
3. If the MAL authorization page fails to load or hangs after you click **Allow**, try the following:
   - open the URL shown in the terminal manually in an **incognito/private** window.
   - clear your MAL cookies or log out of MAL before retrying; a stale session can cause a 405 error on `myanimelist.net/submission/authorization`.
   - inspect the network tab in devtools: MAL's grant form should send a POST to `/submission/authorization`. a 405 there means MAL rejected the method – this is a problem on their side, not your callback.
4. On a successful authorization MAL will redirect back to `/api/auth/callback` with a `code` query parameter. Your app then exchanges the code for tokens.
5. If you still encounter a 400/405 from MAL, copy the **full** URL from the terminal (or browser bar) and share it; check that the `redirect_uri` exactly matches the registered value and that there are no stray characters.
6. After completing the flow you should land on the dashboard. From there you can browse your anime list and add episode notes.

**Italiano:**
1. Avvia il server (`npm run dev`) e apri l'app nel browser.
2. Clicca sul pulsante **Login**. Questo chiama `/api/auth/login` e ti reindirizza a MyAnimeList.
   - il server stamperà comunque l'URL generato e i valori PKCE nel terminale.
3. Se la pagina di autorizzazione MAL non si carica o si blocca dopo aver cliccato **Allow**, prova a:
   - aprire l'URL mostrato nel terminale in una finestra **incognito/privata**.
   - cancellare i cookie di MAL o disconnetterti da MAL prima di riprovare; una sessione obsoleta può causare un errore 405 su `myanimelist.net/submission/authorization`.
   - ispezionare la scheda rete nei devtools: il form di autorizzazione di MAL dovrebbe inviare un POST a `/submission/authorization`. se lì ricevi 405, è un errore lato MAL, non nella tua callback.
4. Se l'autorizzazione riesce, MAL ti reindirizzerà a `/api/auth/callback` con un parametro `code`. La tua app scambierà il codice con i token.
5. Se ricevi ancora un 400/405 da MAL, copia l'**URL completo** dal terminale (o dalla barra del browser) e condividilo; verifica che il `redirect_uri` corrisponda esattamente a quello registrato e che non ci siano caratteri strani.
6. Dopo il completamento del flusso verrai inviato alla dashboard. Da lì potrai navigare la tua lista anime e aggiungere note.



## Project Structure

### New Files
- `src/lib/mal-csv.ts` - parser for MyAnimeList CSV exports
- `src/app/import/page.tsx` - UI for uploading/exporting CSV
- `src/app/api/anime/import/route.ts` - backend endpoint to handle upload and create guest user

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

## Importing Without OAuth

If you don't want to use the OAuth flow (or the MAL API is behaving badly), you can export your anime list from MyAnimeList and upload it manually:

1. Go to <code>My List → Export as CSV</code> on MAL.
2. Visit the **Import** page in MyAnimeNote (link is available on the homepage or directly at `/import`).
3. Optionally provide a username; otherwise a guest account will be generated for you.
4. Upload the CSV file and the app will parse your list and store it in the database.
5. You'll be automatically logged in and redirected to the dashboard.

The import creates a temporary user record (mal_user_id is a negative timestamp) and sets the standard `auth-token` cookie so you can add episode notes and use the rest of the application as normal. To refresh your list you can re-upload a new CSV.

This option is **manual**—if you want automatic syncing later you'll need to use OAuth again.


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
