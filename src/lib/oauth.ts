import { MALOAuthTokens, MALOAuthResponse } from '@/types'

const MAL_CLIENT_ID = process.env.NEXT_PUBLIC_MAL_CLIENT_ID
const MAL_CLIENT_SECRET = process.env.MAL_CLIENT_SECRET
const MAL_REDIRECT_URI = process.env.NEXT_PUBLIC_MAL_REDIRECT_URI

const MAL_OAUTH_AUTHORIZE_URL = 'https://myanimelist.net/v1/oauth2/authorize'
const MAL_OAUTH_TOKEN_URL = 'https://myanimelist.net/v1/oauth2/token'
const MAL_API_BASE_URL = 'https://api.myanimelist.net/v2'

if (!MAL_CLIENT_ID || !MAL_CLIENT_SECRET || !MAL_REDIRECT_URI) {
  throw new Error('Missing MyAnimeList OAuth environment variables')
}

// Generate authorization URL for login
export function getAuthorizationUrl(): string {
  const params = new URLSearchParams({
    client_id: MAL_CLIENT_ID,
    response_type: 'code',
    redirect_uri: MAL_REDIRECT_URI,
    scope: 'read write',
    state: generateRandomString(16)
  })

  return `${MAL_OAUTH_AUTHORIZE_URL}?${params.toString()}`
}

// Exchange authorization code for tokens
export async function exchangeCodeForTokens(code: string): Promise<MALOAuthTokens> {
  const response = await fetch(MAL_OAUTH_TOKEN_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: new URLSearchParams({
      client_id: MAL_CLIENT_ID,
      client_secret: MAL_CLIENT_SECRET,
      code,
      redirect_uri: MAL_REDIRECT_URI,
      grant_type: 'authorization_code'
    }).toString()
  })

  if (!response.ok) {
    const errorData = await response.json()
    throw new Error(`OAuth token exchange failed: ${errorData.error}`)
  }

  const data: MALOAuthResponse = await response.json()

  return {
    access_token: data.access_token,
    refresh_token: data.refresh_token || '',
    expires_in: data.expires_in,
    token_type: data.token_type
  }
}

// Refresh access token using refresh token
export async function refreshAccessToken(refreshToken: string): Promise<MALOAuthTokens> {
  const response = await fetch(MAL_OAUTH_TOKEN_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: new URLSearchParams({
      client_id: MAL_CLIENT_ID,
      client_secret: MAL_CLIENT_SECRET,
      refresh_token: refreshToken,
      grant_type: 'refresh_token'
    }).toString()
  })

  if (!response.ok) {
    const errorData = await response.json()
    throw new Error(`OAuth token refresh failed: ${errorData.error}`)
  }

  const data: MALOAuthResponse = await response.json()

  return {
    access_token: data.access_token,
    refresh_token: data.refresh_token || refreshToken,
    expires_in: data.expires_in,
    token_type: data.token_type
  }
}

// Fetch current user info from MyAnimeList
export async function fetchCurrentUser(accessToken: string): Promise<any> {
  const response = await fetch(`${MAL_API_BASE_URL}/users/@me`, {
    headers: {
      Authorization: `Bearer ${accessToken}`
    }
  })

  if (!response.ok) {
    throw new Error('Failed to fetch current user')
  }

  return response.json()
}

// Helper function to generate random string
function generateRandomString(length: number): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let result = ''
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

export { MAL_API_BASE_URL }
