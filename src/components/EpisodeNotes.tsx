'use client'

import { useState, useEffect } from 'react'
import { useNotes } from '@/hooks/useNotes'

interface EpisodeNotesProps {
  animeId: number
  episodeNumber: number
  episodeTitle?: string
  maxEpisodes?: number
}

export default function EpisodeNotes({
  animeId,
  episodeNumber,
  episodeTitle,
  maxEpisodes
}: EpisodeNotesProps) {
  const { note, loading, error, saving, fetchNote, saveNote, deleteNote, clearError } = useNotes()
  const [isEditing, setIsEditing] = useState(false)
  const [content, setContent] = useState('')

  // Fetch note when component mounts or ids change
  useEffect(() => {
    fetchNote(animeId, episodeNumber)
  }, [animeId, episodeNumber, fetchNote])

  useEffect(() => {
    if (note) {
      setContent(note.content)
    } else {
      setContent('')
    }
  }, [note])

  const handleSave = async () => {
    if (!content.trim()) {
      await handleDelete()
      return
    }

    try {
      await saveNote(animeId, episodeNumber, content)
      setIsEditing(false)
    } catch (err) {
      // Error is already set in hook
    }
  }

  const handleDelete = async () => {
    if (!note) return

    try {
      await deleteNote(animeId, episodeNumber)
      setIsEditing(false)
    } catch (err) {
      // Error is already set in hook
    }
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            Episode {episodeNumber}
            {episodeTitle && ` - ${episodeTitle}`}
          </h3>
          {maxEpisodes && (
            <p className="text-sm text-gray-600">
              {episodeNumber} of {maxEpisodes}
            </p>
          )}
        </div>
        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="px-3 py-1 text-sm bg-mal-primary text-white rounded hover:bg-mal-secondary transition"
          >
            {note ? 'Edit Note' : 'Add Note'}
          </button>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
          <button
            onClick={clearError}
            className="ml-2 text-red-600 hover:text-red-800"
          >
            ✕
          </button>
        </div>
      )}

      {/* View Mode */}
      {!isEditing && note && (
        <div className="text-gray-700 whitespace-pre-wrap">
          {note.content}
        </div>
      )}

      {!isEditing && !note && !loading && (
        <div className="text-gray-500 italic">
          No notes for this episode yet. Click "Add Note" to create one.
        </div>
      )}

      {loading && !note && (
        <div className="text-gray-500">Loading note...</div>
      )}

      {/* Edit Mode */}
      {isEditing && (
        <div className="space-y-4">
          <textarea
            value={content}
            onChange={e => setContent(e.target.value)}
            placeholder="Write your notes here..."
            maxLength={5000}
            disabled={saving}
            className="w-full h-48 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-mal-primary resize-none disabled:opacity-50"
          />

          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">
              {content.length}/5000 characters
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setIsEditing(false)
                  setContent(note?.content || '')
                }}
                disabled={saving}
                className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition disabled:opacity-50"
              >
                Cancel
              </button>
              {note && (
                <button
                  onClick={handleDelete}
                  disabled={saving}
                  className="px-4 py-2 text-white bg-red-600 rounded-lg hover:bg-red-700 transition disabled:opacity-50"
                >
                  {saving ? 'Deleting...' : 'Delete'}
                </button>
              )}
              <button
                onClick={handleSave}
                disabled={saving || !content.trim()}
                className="px-4 py-2 text-white bg-mal-primary rounded-lg hover:bg-mal-secondary transition disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save Note'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Metadata */}
      {note && !isEditing && (
        <div className="mt-4 pt-4 border-t border-gray-200 text-xs text-gray-500">
          <p>Updated: {new Date(note.updated_at).toLocaleString()}</p>
        </div>
      )}
    </div>
  )
}
