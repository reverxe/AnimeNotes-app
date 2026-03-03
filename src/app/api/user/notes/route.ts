import { NextRequest, NextResponse } from 'next/server'
import {
  verifyAuth,
  createErrorResponse,
  createSuccessResponse
} from '@/lib/auth'
import { getUserNotes } from '@/lib/db'

export const runtime = 'nodejs'

export async function GET(request: NextRequest) {
  try {
    const userId = await verifyAuth(request)
    if (!userId) {
      return createErrorResponse('Unauthorized', 401)
    }

    const { searchParams } = new URL(request.url)
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100)
    const offset = parseInt(searchParams.get('offset') || '0')

    const { data, count } = await getUserNotes(userId, limit, offset)

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
    console.error('Get user notes error:', error)
    return createErrorResponse('Failed to fetch notes', 500)
  }
}
