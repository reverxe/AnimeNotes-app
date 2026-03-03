import { NextRequest, NextResponse } from 'next/server'
import { createGuestUser, saveAnimeList } from '@/lib/db'
import { createAuthCookie, verifyAuth, createErrorResponse, createSuccessResponse, checkRateLimit } from '@/lib/auth'

export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  try {
    // rate limit to avoid abuse
    const ip = request.headers.get('x-forwarded-for') || 'unknown'
    if (!checkRateLimit(`import:${ip}`, 5, 60000)) {
      return createErrorResponse('Too many import attempts. Please try again later.', 429)
    }

    const form = await request.formData()
    const file = form.get('file') as Blob | null
    const username = (form.get('username') as string) || ''

    if (!file) {
      return createErrorResponse('No file uploaded', 400)
    }

    let items: any[] = []
    // detect gzipped XML by magic bytes (1f 8b) or XML declaration
    const buf = Buffer.from(await file.arrayBuffer())
    let text = buf.toString('utf8')

    if (buf[0] === 0x1f && buf[1] === 0x8b) {
      // gzipped; decompress
      const { gunzipSync } = await import('zlib')
      text = gunzipSync(buf).toString('utf8')
    }

    console.log('Imported file text starts:', text.slice(0, 200))
    // dynamic import parser to avoid potential module resolution issues
    const { parseMalCsv, parseMalXml } = await import('@/lib/mal-csv')

    if (text.trim().startsWith('<?xml')) {
      console.log('Detected XML format')
      // parse XML format
      items = parseMalXml(text)
    } else {
      console.log('Assuming CSV format')
      items = parseMalCsv(text)
    }
    console.log('Parsed', items.length, 'entries from import')

    if (items.length === 0) {
      return createErrorResponse('Imported file contains no entries', 400)
    }

    // determine or create user
    let userId = await verifyAuth(request)
    let createdCookie: string | null = null
    if (!userId) {
      const user = await createGuestUser(username)
      userId = user.id
      const { cookie } = createAuthCookie(userId)
      createdCookie = cookie
    }

    await saveAnimeList(userId, items)

    const response = createSuccessResponse({ imported: items.length })
    if (createdCookie) {
      response.headers.append('Set-Cookie', createdCookie)
    }
    return response
  } catch (error) {
    console.error('Import error:', error)
    return createErrorResponse('Failed to import CSV', 500)
  }
}