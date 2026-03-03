'use client'

import LoginButton from '@/components/LoginButton'
import Link from 'next/link'
import { useAuth } from '@/hooks/useAuth'

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-mal-primary to-mal-secondary text-white">
      {/* Navigation */}
      <nav className="border-b border-white border-opacity-10">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold">MyAnimeNote</h1>
          <LoginButton />
        </div>
      </nav>

      {/* Hero Section */}
      <div className="max-w-6xl mx-auto px-4 py-20 text-center">
        <h2 className="text-5xl font-bold mb-6">
          Track Your Anime with Personal Notes
        </h2>
        <p className="text-xl text-white text-opacity-90 mb-12 max-w-2xl mx-auto">
          Connect your MyAnimeList account and write detailed episode-by-episode notes for all your favorite anime.
          Keep your thoughts organized and never forget what you loved about each episode.
        </p>

        <div className="flex justify-center gap-4 mb-20">
          <button
            onClick={() => {
              const btn = document.querySelector('button')
              if (btn) {
                const loginBtn = Array.from(document.querySelectorAll('button')).find(
                  b => b.textContent?.includes('Login')
                )
                if (loginBtn) loginBtn.click()
              }
            }}
            className="px-8 py-3 bg-white text-mal-primary font-semibold rounded-lg hover:bg-gray-100 transition"
          >
            Get Started
          </button>
          <Link
            href="#features"
            className="px-8 py-3 border-2 border-white text-white font-semibold rounded-lg hover:bg-white hover:text-mal-primary transition"
          >
            Learn More
          </Link>
        </div>
      {/** second action: import CSV if user prefers manual input */}
      <div className="flex justify-center">
        <Link
          href="/import"
          className="px-6 py-2 mt-4 bg-white text-mal-primary font-semibold rounded-lg hover:bg-gray-100 transition"
        >
          Import from MAL CSV
        </Link>
      </div>

        {/* Features */}
        <div id="features" className="grid md:grid-cols-3 gap-8 mt-20">
          <div className="bg-white bg-opacity-10 rounded-lg p-8 backdrop-blur">
            <div className="text-4xl mb-4">🔐</div>
            <h3 className="text-xl font-semibold mb-2">Secure OAuth2</h3>
            <p className="text-white text-opacity-80">
              Safe authentication with MyAnimeList using OAuth2. Your password never leaves MyAnimeList.
            </p>
          </div>

          <div className="bg-white bg-opacity-10 rounded-lg p-8 backdrop-blur">
            <div className="text-4xl mb-4">📝</div>
            <h3 className="text-xl font-semibold mb-2">Episode Notes</h3>
            <p className="text-white text-opacity-80">
              Write detailed notes for every episode you watch. Save your thoughts and impressions.
            </p>
          </div>

          <div className="bg-white bg-opacity-10 rounded-lg p-8 backdrop-blur">
            <div className="text-4xl mb-4">🔄</div>
            <h3 className="text-xl font-semibold mb-2">Auto Sync</h3>
            <p className="text-white text-opacity-80">
              Automatically sync your anime list with MyAnimeList. Always stay up to date.
            </p>
          </div>

          <div className="bg-white bg-opacity-10 rounded-lg p-8 backdrop-blur">
            <div className="text-4xl mb-4">📁</div>
            <h3 className="text-xl font-semibold mb-2">Manual Import</h3>
            <p className="text-white text-opacity-80">
              Can't use OAuth? Download a CSV from MAL and upload it here to populate your list.
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-white border-opacity-10 mt-20">
        <div className="max-w-6xl mx-auto px-4 py-8 text-center text-white text-opacity-80">
          <p>© 2024 MyAnimeNote. Not affiliated with MyAnimeList.</p>
        </div>
      </footer>
    </div>
  )
}
