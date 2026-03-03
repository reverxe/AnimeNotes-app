import { NextRequest, NextResponse } from 'next/server'
import {
  verifyAuth,
  createErrorResponse,
  createSuccessResponse
} from '@/lib/auth'
import { getUserById } from '@/lib/db'

export const runtime = 'nodejs'

export async function GET(request: NextRequest) {
  try {
    const userId = await verifyAuth(request)
    if (!userId) {
      return createErrorResponse('Unauthorized', 401)
    }

    const user = await getUserById(userId)
    if (!user) {
      return createErrorResponse('User not found', 404)
    }

    // Return user profile without sensitive data
    const { access_token, refresh_token, ...safeUser } = user

    return createSuccessResponse(safeUser)
  } catch (error) {
    console.error('Get profile error:', error)
    return createErrorResponse('Failed to fetch profile', 500)
  }
}
