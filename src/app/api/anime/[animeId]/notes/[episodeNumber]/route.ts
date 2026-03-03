import { NextRequest, NextResponse } from 'next/server'
import {
  verifyAuth,
  createErrorResponse,
  createSuccessResponse
} from '@/lib/auth'
import {
  getNote,
  createNote,
  deleteNote
} from '@/lib/db'

export const runtime = 'nodejs'

// GET /api/anime/[animeId]/notes/[episodeNumber]
export async function GET(
  request: NextRequest,
  { params }: { params: { animeId: string; episodeNumber: string } }
) {
  try {
    const userId = await verifyAuth(request)
    if (!userId) {
      return createErrorResponse('Unauthorized', 401)
    }

    const animeId = parseInt(params.animeId)
    const episodeNumber = parseInt(params.episodeNumber)

    if (isNaN(animeId) || isNaN(episodeNumber)) {
      return createErrorResponse('Invalid parameters', 400)
    }

    const note = await getNote(userId, animeId, episodeNumber)

    return createSuccessResponse({
      note: note || null
    })
  } catch (error) {
    console.error('Get note error:', error)
    return createErrorResponse('Failed to fetch note', 500)
  }
}

// POST /api/anime/[animeId]/notes/[episodeNumber]
export async function POST(
  request: NextRequest,
  { params }: { params: { animeId: string; episodeNumber: string } }
) {
  try {
    const userId = await verifyAuth(request)
    if (!userId) {
      return createErrorResponse('Unauthorized', 401)
    }

    const animeId = parseInt(params.animeId)
    const episodeNumber = parseInt(params.episodeNumber)

    if (isNaN(animeId) || isNaN(episodeNumber)) {
      return createErrorResponse('Invalid parameters', 400)
    }

    const { content } = await request.json()

    if (!content || typeof content !== 'string' || content.trim().length === 0) {
      return createErrorResponse('Content is required', 400)
    }

    if (content.length > 5000) {
      return createErrorResponse('Content exceeds maximum length (5000 characters)', 400)
    }

    const note = await createNote(
      userId,
      animeId,
      episodeNumber,
      content.trim()
    )

    return createSuccessResponse(note, 201)
  } catch (error) {
    console.error('Create note error:', error)
    return createErrorResponse('Failed to create note', 500)
  }
}

// PUT /api/anime/[animeId]/notes/[episodeNumber]
export async function PUT(
  request: NextRequest,
  { params }: { params: { animeId: string; episodeNumber: string } }
) {
  try {
    const userId = await verifyAuth(request)
    if (!userId) {
      return createErrorResponse('Unauthorized', 401)
    }

    const animeId = parseInt(params.animeId)
    const episodeNumber = parseInt(params.episodeNumber)

    if (isNaN(animeId) || isNaN(episodeNumber)) {
      return createErrorResponse('Invalid parameters', 400)
    }

    const { content } = await request.json()

    if (!content || typeof content !== 'string' || content.trim().length === 0) {
      return createErrorResponse('Content is required', 400)
    }

    if (content.length > 5000) {
      return createErrorResponse('Content exceeds maximum length (5000 characters)', 400)
    }

    // Verify note exists and belongs to user
    const existingNote = await getNote(userId, animeId, episodeNumber)
    if (!existingNote) {
      return createErrorResponse('Note not found', 404)
    }

    const note = await createNote(userId, animeId, episodeNumber, content.trim())

    return createSuccessResponse(note)
  } catch (error) {
    console.error('Update note error:', error)
    return createErrorResponse('Failed to update note', 500)
  }
}

// DELETE /api/anime/[animeId]/notes/[episodeNumber]
export async function DELETE(
  request: NextRequest,
  { params }: { params: { animeId: string; episodeNumber: string } }
) {
  try {
    const userId = await verifyAuth(request)
    if (!userId) {
      return createErrorResponse('Unauthorized', 401)
    }

    const animeId = parseInt(params.animeId)
    const episodeNumber = parseInt(params.episodeNumber)

    if (isNaN(animeId) || isNaN(episodeNumber)) {
      return createErrorResponse('Invalid parameters', 400)
    }

    // Verify note exists and belongs to user
    const note = await getNote(userId, animeId, episodeNumber)
    if (!note) {
      return createErrorResponse('Note not found', 404)
    }

    await deleteNote(userId, animeId, episodeNumber)

    return createSuccessResponse({ message: 'Note deleted successfully' })
  } catch (error) {
    console.error('Delete note error:', error)
    return createErrorResponse('Failed to delete note', 500)
  }
}
