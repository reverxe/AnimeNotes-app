'use client'

import { useAuth } from '@/hooks/useAuth'
import Link from 'next/link'

export default function LoginButton() {
  const { isAuthenticated, login, logout, user } = useAuth()

  if (isAuthenticated && user) {
    return (
      <div className="flex items-center gap-4">
        <Link href="/dashboard" className="text-sm font-medium text-gray-700 hover:text-gray-900">
          Dashboard
        </Link>
        <span className="text-sm text-gray-600">
          {user.mal_username}
        </span>
        <button
          onClick={logout}
          className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition"
        >
          Logout
        </button>
      </div>
    )
  }

  return (
    <button
      onClick={login}
      className="px-4 py-2 text-sm font-medium text-white bg-mal-primary rounded-lg hover:bg-mal-secondary transition"
    >
      Login with MyAnimeList
    </button>
  )
}
