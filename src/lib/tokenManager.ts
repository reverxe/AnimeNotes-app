import { supabaseAdmin } from './supabase'
import { refreshAccessToken } from './oauth'
import { MALOAuthTokens } from '@/types'

/**
 * Check if token is expired or about to expire (within 5 minutes)
 */
export function isTokenExpired(expiresAt: string): boolean {
  const expirationTime = new Date(expiresAt).getTime()
  const bufferTime = 5 * 60 * 1000 // 5 minutes buffer
  return Date.now() >= expirationTime - bufferTime
}

/**
 * Get valid access token, refreshing if necessary
 */
export async function getValidAccessToken(userId: string): Promise<string> {
  // Fetch user from database
  const { data: user, error } = await supabaseAdmin
    .from('users')
    .select('access_token, refresh_token, token_expires_at')
    .eq('id', userId)
    .single()

  if (error || !user) {
    throw new Error('User not found')
  }

  // Check if token is expired
  if (!isTokenExpired(user.token_expires_at)) {
    return user.access_token
  }

  // Token is expired, refresh it
  if (!user.refresh_token) {
    throw new Error('No refresh token available')
  }

  try {
    const newTokens: MALOAuthTokens = await refreshAccessToken(user.refresh_token)

    // Update tokens in database
    const expiresAt = new Date(Date.now() + newTokens.expires_in * 1000)
    await supabaseAdmin
      .from('users')
      .update({
        access_token: newTokens.access_token,
        refresh_token: newTokens.refresh_token,
        token_expires_at: expiresAt.toISOString()
      })
      .eq('id', userId)

    return newTokens.access_token
  } catch (error) {
    throw new Error(`Failed to refresh token: ${error}`)
  }
}

/**
 * Calculate token expiration timestamp
 */
export function calculateTokenExpiration(expiresIn: number): Date {
  return new Date(Date.now() + expiresIn * 1000)
}

/**
 * Schedule token refresh before expiration
 */
export function scheduleTokenRefresh(userId: string, expiresIn: number): NodeJS.Timeout {
  // Refresh 5 minutes before actual expiration
  const refreshTime = (expiresIn - 300) * 1000

  return setTimeout(async () => {
    try {
      await getValidAccessToken(userId)
    } catch (error) {
      console.error(`Failed to refresh token for user ${userId}:`, error)
    }
  }, refreshTime)
}
