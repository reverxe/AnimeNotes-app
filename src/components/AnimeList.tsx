'use client'

import { useEffect } from 'react'
import { useAnimeList } from '@/hooks/useAnimeList'
import Link from 'next/link'
import Image from 'next/image'

export default function AnimeListComponent() {
  const {
    anime,
    loading,
    error,
    totalCount,
    currentPage,
    pageSize,
    hasMore,
    fetchAnimeList,
    nextPage,
    previousPage
  } = useAnimeList()

  useEffect(() => {
    fetchAnimeList(0, true) // Sync on load
  }, [])

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => fetchAnimeList(0, true)}
            className="px-4 py-2 bg-mal-primary text-white rounded-lg hover:bg-mal-secondary transition"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  if (loading && anime.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin">
          <div className="border-4 border-gray-300 border-t-mal-primary rounded-full h-12 w-12"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">
          Anime List ({totalCount})
        </h2>
        <button
          onClick={() => fetchAnimeList(0, true)}
          disabled={loading}
          className="px-4 py-2 bg-mal-primary text-white rounded-lg hover:bg-mal-secondary transition disabled:opacity-50"
        >
          {loading ? 'Syncing...' : 'Sync'}
        </button>
      </div>

      {/* Anime Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {anime.map(item => (
          <Link
            key={item.node.id}
            href={`/anime/${item.node.id}`}
            className="group bg-white rounded-lg shadow hover:shadow-lg transition overflow-hidden"
          >
            {item.node.main_picture && (
              <div className="relative overflow-hidden bg-gray-200 h-48">
                <Image
                  src={item.node.main_picture.large || item.node.main_picture.small}
                  alt={item.node.title}
                  fill
                  className="object-cover group-hover:scale-105 transition"
                />
              </div>
            )}
            <div className="p-4">
              <h3 className="font-semibold text-gray-900 line-clamp-2 group-hover:text-mal-primary transition">
                {item.node.title}
              </h3>
              <div className="mt-3 text-sm text-gray-600 space-y-1">
                <p>Status: <span className="font-medium capitalize">{item.list_status.status.replace('_', ' ')}</span></p>
                <p>Episodes: <span className="font-medium">{item.list_status.num_episodes_watched}/{item.node.num_episodes || '?'}</span></p>
                {item.list_status.score > 0 && (
                  <p>Score: <span className="font-medium">{item.list_status.score}/10</span></p>
                )}
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Pagination */}
      {anime.length > 0 && (
        <div className="flex items-center justify-between">
          <button
            onClick={previousPage}
            disabled={currentPage === 0 || loading}
            className="px-4 py-2 bg-gray-200 text-gray-900 rounded-lg hover:bg-gray-300 transition disabled:opacity-50"
          >
            Previous
          </button>
          <span className="text-sm text-gray-600">
            Page {currentPage + 1} • Showing {Math.min(pageSize, anime.length)} of {totalCount}
          </span>
          <button
            onClick={nextPage}
            disabled={!hasMore || loading}
            className="px-4 py-2 bg-mal-primary text-white rounded-lg hover:bg-mal-secondary transition disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}

      {anime.length === 0 && !loading && (
        <div className="text-center py-12">
          <p className="text-gray-600">No anime in your list yet.</p>
        </div>
      )}
    </div>
  )
}
