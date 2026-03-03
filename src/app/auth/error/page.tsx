'use client'

import Link from 'next/link'
import { useSearchParams } from 'next/navigation'

export default function AuthErrorPage() {
  const searchParams = useSearchParams()
  const error = searchParams.get('error') || 'An authentication error occurred'

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-mal-primary">AnimeNotes</h1>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-4 py-20 text-center">
        <div className="bg-red-50 border border-red-200 rounded-lg p-8 max-w-md mx-auto">
          <h2 className="text-2xl font-bold text-red-700 mb-4">Authentication Error</h2>
          <p className="text-red-600 mb-6">{error}</p>
          <Link
            href="/"
            className="inline-block px-6 py-2 bg-mal-primary text-white rounded-lg hover:bg-mal-secondary transition"
          >
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  )
}
