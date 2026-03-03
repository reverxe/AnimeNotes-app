import { NextRequest, NextResponse } from 'next/server'
import { verifyAuth, createErrorResponse, createSuccessResponse } from '@/lib/auth'
import { getUserAnimeList, getUserById } from '@/lib/db'
import { fetchUserAnimeList } from '@/lib/mal-api'
import { getValidAccessToken, isTokenExpired } from '@/lib/tokenManager'
import { saveAnimeList } from '@/lib/db'
import { supabaseAdmin } from '@/lib/supabase'

export const runtime = 'nodejs'

export async function GET(request: NextRequest) {
  try {
    // Verify user is authenticated
    const userId = await verifyAuth(request)
    if (!userId) {
      return createErrorResponse('Unauthorized', 401)
    }

    // Get pagination parameters
    const { searchParams } = new URL(request.url)
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100)
    const offset = parseInt(searchParams.get('offset') || '0')
    const sync = searchParams.get('sync') === 'true'

    // Get user info
    const user = await getUserById(userId)
    if (!user) {
      return createErrorResponse('User not found', 404)
    }

    // Sync with MyAnimeList if requested or last sync is older than 1 hour
    if (sync || !user.last_synced_at || Date.now() - new Date(user.last_synced_at).getTime() > 3600000) {
      try {
        const accessToken = await getValidAccessToken(userId)

        let allAnime = []
        let hasMore = true
        let syncOffset = 0

        // Fetch all anime from MyAnimeList
        while (hasMore) {
          const response = await fetchUserAnimeList(accessToken, 100, syncOffset)
          allAnime = allAnime.concat(response.data)

          if (response.paging.next) {
            syncOffset += 100
          } else {
            hasMore = false
          }
        }

        // Save to database
        if (allAnime.length > 0) {
          await saveAnimeList(userId, allAnime)
        }

        // Update last_synced_at
        await supabaseAdmin
          .from('users')
          .update({ last_synced_at: new Date().toISOString() })
          .eq('id', userId)
      } catch (syncError) {
        console.error('Sync error:', syncError)
        // Continue with cached data if sync fails
      }
    }

    // Get paginated anime list from database
    const { data, count } = await getUserAnimeList(userId, limit, offset)

    return createSuccessResponse({
      data,
      pagination: {
        limit,
        offset,
        total: count || 0,
        hasMore: offset + limit < (count || 0)
      }
    })
  } catch (error) {
    console.error('Get anime list error:', error)
    return createErrorResponse('Failed to fetch anime list', 500)
  }
}
