import { useState, useCallback } from 'react'
import { AnimeNote } from '@/types'

interface UseNotesResult {
  note: AnimeNote | null
  loading: boolean
  error: string | null
  saving: boolean
  fetchNote: (animeId: number, episodeNumber: number) => Promise<void>
  saveNote: (animeId: number, episodeNumber: number, content: string) => Promise<void>
  deleteNote: (animeId: number, episodeNumber: number) => Promise<void>
  clearError: () => void
}

export function useNotes(): UseNotesResult {
  const [note, setNote] = useState<AnimeNote | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  const fetchNote = useCallback(async (animeId: number, episodeNumber: number) => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch(`/api/anime/${animeId}/notes/${episodeNumber}`)

      if (!response.ok) {
        throw new Error('Failed to fetch note')
      }

      const data = await response.json()
      setNote(data.data.note)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }, [])

  const saveNote = useCallback(
    async (animeId: number, episodeNumber: number, content: string) => {
      try {
        setSaving(true)
        setError(null)

        const method = note ? 'PUT' : 'POST'
        const response = await fetch(
          `/api/anime/${animeId}/notes/${episodeNumber}`,
          {
            method,
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ content })
          }
        )

        if (!response.ok) {
          const error = await response.json()
          throw new Error(error.error || 'Failed to save note')
        }

        const data = await response.json()
        setNote(data.data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
        throw err
      } finally {
        setSaving(false)
      }
    },
    [note]
  )

  const deleteNote = useCallback(async (animeId: number, episodeNumber: number) => {
    try {
      setSaving(true)
      setError(null)

      const response = await fetch(
        `/api/anime/${animeId}/notes/${episodeNumber}`,
        {
          method: 'DELETE'
        }
      )

      if (!response.ok) {
        throw new Error('Failed to delete note')
      }

      setNote(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      throw err
    } finally {
      setSaving(false)
    }
  }, [])

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  return {
    note,
    loading,
    error,
    saving,
    fetchNote,
    saveNote,
    deleteNote,
    clearError
  }
}
