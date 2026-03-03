import { useState, useEffect, useCallback } from 'react'
import { UserProfile } from '@/types'

interface UseAuthResult {
  user: UserProfile | null
  loading: boolean
  error: string | null
  login: () => Promise<void>
  logout: () => Promise<void>
  isAuthenticated: boolean
  refetch: () => Promise<void>
}

export function useAuth(): UseAuthResult {
  const [user, setUser] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchProfile = useCallback(async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/user/profile')

      if (!response.ok) {
        if (response.status === 401) {
          setUser(null)
        } else {
          throw new Error('Failed to fetch profile')
        }
      } else {
        const data = await response.json()
        setUser(data.data)
      }

      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      setUser(null)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchProfile()
  }, [fetchProfile])

  const login = useCallback(async () => {
    // simply navigate to the login endpoint; the server will issue a
    // 307 redirect to the MyAnimeList authorization URL and the browser
    // will follow it automatically. this avoids any fetch-related
    // issues with cross-origin redirect URLs.
    window.location.href = '/api/auth/login'
  }, [])

  const logout = useCallback(async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
      setUser(null)
      window.location.href = '/'
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Logout failed')
    }
  }, [])

  return {
    user,
    loading,
    error,
    login,
    logout,
    isAuthenticated: !!user,
    refetch: fetchProfile
  }
}
