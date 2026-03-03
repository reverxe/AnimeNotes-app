import { NextRequest, NextResponse } from 'next/server'
import {
  verifyAuth,
  createErrorResponse,
  createSuccessResponse
} from '@/lib/auth'
import {
  getAnimeListItem,
  getAnimeNotes
} from '@/lib/db'
import {
  fetchAnimeDetails,
  fetchAnimeStats
} from '@/lib/mal-api'

export const runtime = 'nodejs'

export async function GET(
  request: NextRequest,
  { params }: { params: { animeId: string } }
) {
  try {
    // Verify user is authenticated
    const userId = await verifyAuth(request)
    if (!userId) {
      return createErrorResponse('Unauthorized', 401)
    }

    const animeId = parseInt(params.animeId)
    if (isNaN(animeId)) {
      return createErrorResponse('Invalid anime ID', 400)
    }

    // Get anime from user's list
    const animeListItem = await getAnimeListItem(userId, animeId)
    if (!animeListItem) {
      return createErrorResponse('Anime not found in your list', 404)
    }

    // Fetch detailed info from MAL API
    let animeDetails = null
    let animeStats = null

    try {
      [animeDetails, animeStats] = await Promise.all([
        fetchAnimeDetails(animeId),
        fetchAnimeStats(animeId)
      ])
    } catch (detailsError) {
      console.error('Failed to fetch anime details:', detailsError)
      // Continue with local data if API fails
    }

    // Get user's notes for this anime
    const notes = await getAnimeNotes(userId, animeId)

    return createSuccessResponse({
      anime: animeListItem,
      details: animeDetails,
      stats: animeStats,
      notes,
      noteCount: notes.length
    })
  } catch (error) {
    console.error('Get anime details error:', error)
    return createErrorResponse('Failed to fetch anime details', 500)
  }
}
