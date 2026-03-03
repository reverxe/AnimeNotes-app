'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import ProtectedRoute from '@/components/ProtectedRoute'
import EpisodeNotes from '@/components/EpisodeNotes'
import LoginButton from '@/components/LoginButton'
import Image from 'next/image'
import Link from 'next/link'

interface AnimeDetailsData {
  anime: any
  details: any
  stats: any
  noteCount: number
}

export default function AnimePage() {
  const params = useParams()
  const animeId = parseInt(params.animeId as string)

  const [data, setData] = useState<AnimeDetailsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedEpisode, setSelectedEpisode] = useState(1)

  useEffect(() => {
    const fetchAnimeDetails = async () => {
      try {
        setLoading(true)
        const response = await fetch(`/api/anime/${animeId}`)

        if (!response.ok) {
          throw new Error('Failed to fetch anime details')
        }

        const result = await response.json()
        setData(result.data)
        setError(null)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
      } finally {
        setLoading(false)
      }
    }

    fetchAnimeDetails()
  }, [animeId])

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin">
            <div className="border-4 border-gray-300 border-t-mal-primary rounded-full h-12 w-12"></div>
          </div>
        </div>
      </ProtectedRoute>
    )
  }

  if (error || !data) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gray-50">
          <nav className="bg-white shadow">
            <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
              <h1 className="text-2xl font-bold text-mal-primary">AnimeNotes</h1>
              <LoginButton />
            </div>
          </nav>

          <main className="max-w-6xl mx-auto px-4 py-8">
            <Link href="/dashboard" className="text-mal-primary hover:text-mal-secondary mb-4 inline-block">
              ← Back to Dashboard
            </Link>
            <div className="text-center text-red-600">
              <p>{error || 'Failed to load anime details'}</p>
            </div>
          </main>
        </div>
      </ProtectedRoute>
    )
  }

  const anime = data.anime
  const numEpisodes = anime.num_episodes || data.details?.num_episodes || 0

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <nav className="bg-white shadow">
          <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
            <h1 className="text-2xl font-bold text-mal-primary">AnimeNotes</h1>
            <LoginButton />
          </div>
        </nav>

        {/* Main Content */}
        <main className="max-w-6xl mx-auto px-4 py-8">
          <Link href="/dashboard" className="text-mal-primary hover:text-mal-secondary mb-4 inline-block">
            ← Back to Dashboard
          </Link>

          <div className="grid md:grid-cols-[300px_1fr] gap-8 mb-8">
            {/* Sidebar */}
            <div className="space-y-6">
              {anime.mal_picture_large && (
                <div className="relative bg-gray-200 rounded-lg overflow-hidden h-[400px]">
                  <Image
                    src={anime.mal_picture_large}
                    alt={anime.title}
                    fill
                    className="object-cover"
                  />
                </div>
              )}

              <div className="bg-white rounded-lg shadow p-4 space-y-3">
                <div>
                  <p className="text-sm text-gray-600">Status</p>
                  <p className="font-semibold capitalize">
                    {anime.status.replace('_', ' ')}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Episodes</p>
                  <p className="font-semibold">
                    {anime.num_episodes_watched}/{numEpisodes || '?'}
                  </p>
                </div>
                {anime.score > 0 && (
                  <div>
                    <p className="text-sm text-gray-600">Your Score</p>
                    <p className="font-semibold">{anime.score}/10</p>
                  </div>
                )}
                <div>
                  <p className="text-sm text-gray-600">Personal Notes</p>
                  <p className="font-semibold">{data.noteCount}</p>
                </div>
              </div>
            </div>

            {/* Main Content */}
            <div className="space-y-6">
              <div>
                <h1 className="text-4xl font-bold text-gray-900 mb-2">
                  {anime.title}
                </h1>
                {data.details?.synopsis && (
                  <p className="text-gray-600 leading-relaxed">
                    {data.details.synopsis}
                  </p>
                )}
              </div>

              {/* Episode Selector */}
              {numEpisodes > 0 && (
                <div className="bg-white rounded-lg shadow p-6">
                  <h2 className="text-xl font-semibold mb-4">Select Episode</h2>
                  <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2">
                    {Array.from({ length: Math.min(numEpisodes, anime.num_episodes_watched + 5) }).map(
                      (_, i) => {
                        const ep = i + 1
                        const isWatched = ep <= anime.num_episodes_watched
                        return (
                          <button
                            key={ep}
                            onClick={() => setSelectedEpisode(ep)}
                            className={`aspect-square flex items-center justify-center rounded font-semibold transition ${
                              selectedEpisode === ep
                                ? 'bg-mal-primary text-white'
                                : isWatched
                                  ? 'bg-green-100 text-green-900 hover:bg-green-200'
                                  : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                            }`}
                          >
                            {ep}
                          </button>
                        )
                      }
                    )}
                  </div>
                </div>
              )}

              {/* Episode Notes */}
              <EpisodeNotes
                animeId={animeId}
                episodeNumber={selectedEpisode}
                episodeTitle={`Episode ${selectedEpisode}`}
                maxEpisodes={numEpisodes}
              />
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  )
}
