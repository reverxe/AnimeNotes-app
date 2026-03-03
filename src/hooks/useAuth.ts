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
    try {
      const response = await fetch('/api/auth/login')
      const data = await response.json()

      if (data.success && data.authUrl) {
        window.location.href = data.authUrl
      } else {
        setError('Failed to initiate login')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed')
    }
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
