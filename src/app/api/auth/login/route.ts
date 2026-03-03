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

    // construct a redirect URI using the host header so the port matches whatever
    // the dev server is currently listening on. this prevents a mismatch between
    // the registered URI and the one we send to MAL.
    const host = request.headers.get('host')
    const protocol = request.headers.get('x-forwarded-proto') || 'http'
    const redirectUri = `${protocol}://${host}/api/auth/callback`

    const { authUrl, codeVerifier, codeChallenge, state } = getAuthorizationUrlWithPKCE(redirectUri)

    // DEBUG: log detailed PKCE info so we can inspect what is being sent to MAL
    console.log('Using redirect URI:', redirectUri)
    console.log('Generated authUrl:', authUrl)
    console.log('PKCE state / challenge:', { state, codeChallenge })
    
    // redirect the browser immediately
    const response = NextResponse.redirect(authUrl)
    response.cookies.set('pkce_verifier', codeVerifier, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 600 // 10 minutes
    })

    return response
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
