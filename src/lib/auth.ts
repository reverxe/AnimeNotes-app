import { NextRequest, NextResponse } from 'next/server'
import { jwtVerify } from 'jose'

const secretKey = process.env.NEXTAUTH_SECRET || 'your-secret-key'
const secret = new TextEncoder().encode(secretKey)

/**
 * Verify JWT token from cookie
 */
export async function verifyAuth(request: NextRequest): Promise<string | null> {
  try {
    const token = request.cookies.get('auth-token')?.value

    if (!token) {
      return null
    }

    const verified = await jwtVerify(token, secret)
    return verified.payload.sub as string
  } catch (error) {
    return null
  }
}

/**
 * Create secure HTTP-only cookie response
 */
export function createAuthCookie(token: string): { cookie: string; maxAge: number } {
  const maxAge = 7 * 24 * 60 * 60 // 7 days
  const cookie = `auth-token=${token}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${maxAge}`

  return { cookie, maxAge }
}

/**
 * Clear auth cookie
 */
export function clearAuthCookie(): string {
  return 'auth-token=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0'
}

/**
 * Create error response
 */
export function createErrorResponse(
  message: string,
  status: number = 400
): NextResponse {
  return NextResponse.json(
    { success: false, error: message },
    { status }
  )
}

/**
 * Create success response
 */
export function createSuccessResponse<T>(
  data: T,
  status: number = 200
): NextResponse {
  return NextResponse.json(
    { success: true, data },
    { status }
  )
}

/**
 * Validate required environment variables
 */
export function validateEnvVariables(variables: string[]): void {
  const missing = variables.filter(v => !process.env[v])

  if (missing.length > 0) {
    throw new Error(`Missing environment variables: ${missing.join(', ')}`)
  }
}

/**
 * Rate limiting helper (simple in-memory implementation)
 */
const rateLimitStore = new Map<string, { count: number; resetTime: number }>()

export function checkRateLimit(
  identifier: string,
  limit: number = 10,
  windowMs: number = 60000
): boolean {
  const now = Date.now()
  const record = rateLimitStore.get(identifier)

  if (!record || now > record.resetTime) {
    rateLimitStore.set(identifier, {
      count: 1,
      resetTime: now + windowMs
    })
    return true
  }

  if (record.count < limit) {
    record.count++
    return true
  }

  return false
}
