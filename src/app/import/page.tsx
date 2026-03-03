'use client'

import { useState, FormEvent } from 'react'
import { useRouter } from 'next/navigation'

export default function ImportPage() {
  const [file, setFile] = useState<File | null>(null)
  const [username, setUsername] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!file) {
      setError('Please select a CSV file')
      return
    }
    setLoading(true)
    const form = new FormData()
    form.append('file', file)
    form.append('username', username)

    try {
      const res = await fetch('/api/anime/import', {
        method: 'POST',
        body: form
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Import failed')
      } else {
        router.push('/dashboard')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow p-8 w-full max-w-md">
        <h1 className="text-2xl font-bold mb-4">Import MAL CSV</h1>
        <p className="text-gray-600 mb-4">
          Export your anime list from MyAnimeList (<code>My List → Export</code>)
          and upload it here. You can optionally enter a username for this import.
        </p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Username (optional)
            </label>
            <input
              type="text"
              value={username}
              onChange={e => setUsername(e.target.value)}
              className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              CSV File
            </label>
            <input
              type="file"
              accept=".csv,.xml,.gz"
              onChange={e => setFile(e.target.files?.[0] || null)}
              className="mt-1"
            />
          </div>
          {error && <p className="text-red-600">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full px-4 py-2 bg-mal-primary text-white rounded-lg hover:bg-mal-secondary transition"
          >
            {loading ? 'Importing…' : 'Import'}
          </button>
        </form>
      </div>
    </div>
  )
}
