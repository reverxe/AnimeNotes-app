import { MALOAuthTokens, MALOAuthResponse } from '@/types'
import crypto from 'crypto'

const MAL_CLIENT_ID = process.env.NEXT_PUBLIC_MAL_CLIENT_ID
const MAL_CLIENT_SECRET = process.env.MAL_CLIENT_SECRET
const MAL_REDIRECT_URI = process.env.NEXT_PUBLIC_MAL_REDIRECT_URI

const MAL_OAUTH_AUTHORIZE_URL = 'https://myanimelist.net/v1/oauth2/authorize'
const MAL_OAUTH_TOKEN_URL = 'https://myanimelist.net/v1/oauth2/token'
const MAL_API_BASE_URL = 'https://api.myanimelist.net/v2'

if (!MAL_CLIENT_ID || !MAL_CLIENT_SECRET || !MAL_REDIRECT_URI) {
  throw new Error('Missing MyAnimeList OAuth environment variables')
}

// Generate PKCE code verifier and challenge
function generateCodeVerifier(): string {
  // PKCE requires 43-128 characters, using unreserved characters: [A-Z] [a-z] [0-9] - . _ ~
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~'
  let result = ''
  for (let i = 0; i < 128; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

function generateCodeChallenge(codeVerifier: string): string {
  const challenge = crypto
    .createHash('sha256')
    .update(codeVerifier)
    .digest('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '')
  return challenge
}

// Generate authorization URL for login with PKCE
export function getAuthorizationUrlWithPKCE(overrideRedirectUri?: string): { authUrl: string; codeVerifier: string; codeChallenge: string; state: string } {
  const codeVerifier = generateCodeVerifier()
  const codeChallenge = generateCodeChallenge(codeVerifier)
  const state = generateRandomString(16)

  // allow caller to override the redirect URI (useful during dev when port may vary)
  const redirectUri = overrideRedirectUri || MAL_REDIRECT_URI
  const params = new URLSearchParams({
    client_id: MAL_CLIENT_ID,
    response_type: 'code',
    redirect_uri: redirectUri,
    state,
    code_challenge: codeChallenge,
    code_challenge_method: 'S256'
  })

  // URLSearchParams encodes spaces as '+', but MAL seems finicky; use '%20' to be safe
  params.set('scope', 'read write')
  let authUrl = `${MAL_OAUTH_AUTHORIZE_URL}?${params.toString()}`
  // replace any pluses in the query with percent-20 (especially in scope)
  authUrl = authUrl.replace(/\+/g, '%20')

  return { authUrl, codeVerifier, codeChallenge, state }
}

// Legacy function for backwards compatibility
export function getAuthorizationUrl(): string {
  const { authUrl } = getAuthorizationUrlWithPKCE()
  return authUrl
}

// Exchange authorization code for tokens with PKCE
export async function exchangeCodeForTokens(code: string, codeVerifier?: string): Promise<MALOAuthTokens> {
  const body: Record<string, string> = {
    client_id: MAL_CLIENT_ID,
    client_secret: MAL_CLIENT_SECRET,
    code,
    redirect_uri: MAL_REDIRECT_URI,
    grant_type: 'authorization_code'
  }

  // Add code_verifier if PKCE is being used
  if (codeVerifier) {
    body.code_verifier = codeVerifier
  }

  const response = await fetch(MAL_OAUTH_TOKEN_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: new URLSearchParams(body).toString()
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
