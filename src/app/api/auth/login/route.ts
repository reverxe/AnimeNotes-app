import { NextRequest, NextResponse } from 'next/server'
import { getAuthorizationUrlWithPKCE } from '@/lib/oauth'
import { createErrorResponse, checkRateLimit } from '@/lib/auth'

export const runtime = 'nodejs'

export async function GET(request: NextRequest) {
  try {
    // Rate limiting
    const ip = request.headers.get('x-forwarded-for') || 'unknown'
    if (!checkRateLimit(`login:${ip}`, 20, 60000)) {
      return createErrorResponse('Too many login attempts. Please try again later.', 429)
    }

    const { authUrl, codeVerifier } = getAuthorizationUrlWithPKCE()

    // DEBUG: log authUrl for troubleshooting
    console.log('Generated authUrl:', authUrl)
    
    // Create response and set code_verifier in cookie for later use
    const response = NextResponse.json({ success: true, authUrl })
    response.cookies.set('pkce_verifier', codeVerifier, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 600 // 10 minutes
    })
    
    return response
  } catch (error) {
    console.error('Login error:', error)
    return createErrorResponse('Failed to generate authorization URL', 500)
  }
}
