import { useState, useCallback } from 'react'
import { AnimeListItem } from '@/types'

interface UseAnimeListResult {
  anime: AnimeListItem[]
  loading: boolean
  error: string | null
  totalCount: number
  currentPage: number
  pageSize: number
  hasMore: boolean
  fetchAnimeList: (page?: number, sync?: boolean) => Promise<void>
  nextPage: () => Promise<void>
  previousPage: () => Promise<void>
  setPageSize: (size: number) => void
}

export function useAnimeList(initialPageSize = 50): UseAnimeListResult {
  const [anime, setAnime] = useState<AnimeListItem[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [totalCount, setTotalCount] = useState(0)
  const [currentPage, setCurrentPage] = useState(0)
  const [pageSize, setPageSize] = useState(initialPageSize)
  const [hasMore, setHasMore] = useState(false)

  const fetchAnimeList = useCallback(
    async (page = 0, sync = false) => {
      try {
        setLoading(true)
        const offset = page * pageSize

        const response = await fetch(
          `/api/anime/list?limit=${pageSize}&offset=${offset}&sync=${sync}`
        )

        if (!response.ok) {
          throw new Error('Failed to fetch anime list')
        }

        const data = await response.json()
        setAnime(data.data.data)
        setTotalCount(data.data.pagination.total)
        setHasMore(data.data.pagination.hasMore)
        setCurrentPage(page)
        setError(null)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
      } finally {
        setLoading(false)
      }
    },
    [pageSize]
  )

  const nextPage = useCallback(async () => {
    await fetchAnimeList(currentPage + 1)
  }, [currentPage, fetchAnimeList])

  const previousPage = useCallback(async () => {
    if (currentPage > 0) {
      await fetchAnimeList(currentPage - 1)
    }
  }, [currentPage, fetchAnimeList])

  return {
    anime,
    loading,
    error,
    totalCount,
    currentPage,
    pageSize,
    hasMore,
    fetchAnimeList,
    nextPage,
    previousPage,
    setPageSize
  }
}
