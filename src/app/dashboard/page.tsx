'use client'

import ProtectedRoute from '@/components/ProtectedRoute'
import AnimeListComponent from '@/components/AnimeList'
import LoginButton from '@/components/LoginButton'
import { useAuth } from '@/hooks/useAuth'

export default function DashboardPage() {
  const { user } = useAuth()

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
          {user && (
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                Welcome, {user.mal_username}!
              </h2>
              <p className="text-gray-600">
                Manage your anime list and write personal notes for each episode.
              </p>
            </div>
          )}

          <AnimeListComponent />
        </main>
      </div>
    </ProtectedRoute>
  )
}
