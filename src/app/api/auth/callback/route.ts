import { NextRequest, NextResponse } from 'next/server'
import {
  exchangeCodeForTokens,
  fetchCurrentUser,
  MAL_API_BASE_URL
} from '@/lib/oauth'
import {
  upsertUser,
  updateUserTokens,
  saveAnimeList
} from '@/lib/db'
import { fetchUserAnimeList } from '@/lib/mal-api'
import {
  createErrorResponse,
  createSuccessResponse,
  calculateTokenExpiration,
  checkRateLimit
} from '@/lib/auth'
import { createAuthCookie } from '@/lib/auth'
import axios from 'axios'

export const runtime = 'nodejs'

export async function GET(request: NextRequest) {
  try {
    // Rate limiting
    const ip = request.headers.get('x-forwarded-for') || 'unknown'
    if (!checkRateLimit(`callback:${ip}`, 30, 60000)) {
      return createErrorResponse('Too many callback attempts. Please try again later.', 429)
    }

    const { searchParams } = new URL(request.url)
    const code = searchParams.get('code')
    const error = searchParams.get('error')
    const state = searchParams.get('state')

    // Check for OAuth errors
    if (error) {
      const errorDescription = searchParams.get('error_description') || error
      console.error('OAuth error:', errorDescription)
      return NextResponse.redirect(
        new URL(`/auth/error?error=${encodeURIComponent(errorDescription)}`, request.url)
      )
    }

    // Validate required parameters
    if (!code) {
      return createErrorResponse('Missing authorization code', 400)
    }

    // Exchange code for tokens
    const tokens = await exchangeCodeForTokens(code)

    // Fetch current user info from MyAnimeList
    const userResponse = await axios.get(`${MAL_API_BASE_URL}/users/@me`, {
      headers: {
        Authorization: `Bearer ${tokens.access_token}`
      }
    })

    const malUser = userResponse.data
    const tokenExpiration = calculateTokenExpiration(tokens.expires_in)

    // Upsert user in database
    const user = await upsertUser(
      malUser.id,
      malUser.name,
      tokens.access_token,
      tokens.refresh_token,
      tokenExpiration,
      malUser.email
    )

    // Fetch and sync user's anime list
    try {
      let allAnime = []
      let hasMore = true
      let offset = 0

      while (hasMore) {
        const response = await fetchUserAnimeList(tokens.access_token, 100, offset)
        allAnime = allAnime.concat(response.data)

        // Check if there are more results
        if (response.paging.next) {
          offset += 100
        } else {
          hasMore = false
        }
      }

      // Save anime list to database
      if (allAnime.length > 0) {
        await saveAnimeList(user.id, allAnime)
      }
    } catch (syncError) {
      console.error('Failed to sync anime list:', syncError)
      // Continue even if sync fails - user can still login
    }

    // Create response with auth cookie
    const response = NextResponse.redirect(
      new URL('/dashboard', request.url)
    )

    const { cookie } = createAuthCookie(user.id)
    response.headers.append('Set-Cookie', cookie)

    return response
  } catch (error) {
    console.error('Callback error:', error)
    return NextResponse.redirect(
      new URL(
        `/auth/error?error=${encodeURIComponent('Authentication failed. Please try again.')}`,
        request.url
      )
    )
  }
}

// Helper function (missing from previous auth.ts)
function calculateTokenExpiration(expiresIn: number): Date {
  return new Date(Date.now() + expiresIn * 1000)
}
