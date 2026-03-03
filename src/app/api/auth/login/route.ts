import { NextRequest, NextResponse } from 'next/server'
import { getAuthorizationUrl } from '@/lib/oauth'
import { createErrorResponse, checkRateLimit } from '@/lib/auth'

export const runtime = 'nodejs'

export async function GET(request: NextRequest) {
  try {
    // Rate limiting
    const ip = request.headers.get('x-forwarded-for') || 'unknown'
    if (!checkRateLimit(`login:${ip}`, 20, 60000)) {
      return createErrorResponse('Too many login attempts. Please try again later.', 429)
    }

    const authUrl = getAuthorizationUrl()
    return NextResponse.json({ success: true, authUrl })
  } catch (error) {
    console.error('Login error:', error)
    return createErrorResponse('Failed to generate authorization URL', 500)
  }
}
