import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'MyAnimeNote - Track Your Anime with Personal Notes',
  description: 'Connect your MyAnimeList account and take personalized episode notes',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="bg-gray-50">
        {children}
      </body>
    </html>
  )
}
