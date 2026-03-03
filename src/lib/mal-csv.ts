// utilities for parsing MyAnimeList exports (CSV or XML)
import { AnimeListItem } from '@/types'

// --- CSV helpers ---
// split a line into fields handling quoted commas
function splitCsvLine(line: string): string[] {
  const result: string[] = []
  let current = ''
  let inQuotes = false

  for (let i = 0; i < line.length; i++) {
    const char = line[i]
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        // escaped quote
        current += '"'
        i++
      } else {
        inQuotes = !inQuotes
      }
    } else if (char === ',' && !inQuotes) {
      result.push(current)
      current = ''
    } else {
      current += char
    }
  }
  result.push(current)
  return result
}

function mapStatus(raw: string): AnimeListItem['list_status']['status'] {
  const s = raw.trim().toLowerCase().replace(/ /g, '_')
  switch (s) {
    case 'watching':
      return 'watching'
    case 'completed':
      return 'completed'
    case 'on_hold':
    case 'on-hold':
      return 'on_hold'
    case 'dropped':
      return 'dropped'
    case 'plan_to_watch':
    case 'plan to watch':
      return 'plan_to_watch'
    default:
      return 'plan_to_watch'
  }
}

export function parseMalCsv(csv: string): AnimeListItem[] {
  const lines = csv.split(/\r?\n/).filter(l => l.trim().length > 0)
  if (lines.length === 0) return []

  const header = splitCsvLine(lines[0]).map(h => h.trim().toLowerCase())
  const idx = {
    id: header.indexOf('anime_id'),
    title: header.indexOf('title'),
    status: header.indexOf('status'),
    score: header.indexOf('score') !== -1 ? header.indexOf('score') : header.indexOf('my_score'),
    watched: header.indexOf('episodes_watched') !== -1 ? header.indexOf('episodes_watched') : header.indexOf('watched_episodes'),
    numEpisodes: header.indexOf('episodes') !== -1 ? header.indexOf('episodes') : header.indexOf('num_episodes')
  }

  const items: AnimeListItem[] = []

  for (let i = 1; i < lines.length; i++) {
    const cols = splitCsvLine(lines[i])
    const id = idx.id !== -1 ? Number(cols[idx.id]) : NaN
    if (isNaN(id)) continue
    const title = idx.title !== -1 ? cols[idx.title] : ''
    const statusRaw = idx.status !== -1 ? cols[idx.status] : ''
    const scoreRaw = idx.score !== -1 ? cols[idx.score] : '0'
    const watchedRaw = idx.watched !== -1 ? cols[idx.watched] : '0'
    const numEpRaw = idx.numEpisodes !== -1 ? cols[idx.numEpisodes] : ''

    items.push({
      node: {
        id,
        title,
        num_episodes: numEpRaw ? Number(numEpRaw) : undefined
      },
      list_status: {
        status: mapStatus(statusRaw),
        score: parseInt(scoreRaw, 10) || 0,
        num_episodes_watched: parseInt(watchedRaw, 10) || 0,
        last_updated_at: new Date().toISOString()
      }
    })
  }

  return items
}

// --- XML parser for MyAnimeList export (gzipped or plain) ---
export function parseMalXml(xml: string): AnimeListItem[] {
  const items: AnimeListItem[] = []
  const animeBlocks = xml.match(/<anime>[\s\S]*?<\/anime>/g) || []

  animeBlocks.forEach(block => {
    const get = (tag: string) => {
      const m = block.match(new RegExp(`<${tag}>([\s\S]*?)<\/${tag}>`))
      return m ? m[1] : ''
    }

    const id = Number(get('series_animedb_id'))
    if (!id) return

    const title = get('series_title')
    const epWatched = Number(get('my_watched_episodes')) || 0
    const score = Number(get('my_score')) || 0
    const statusNum = Number(get('my_status'))
    const numEp = Number(get('series_episodes')) || undefined

    const statusMap: Record<number, AnimeListItem['list_status']['status']> = {
      1: 'watching',
      2: 'completed',
      3: 'on_hold',
      4: 'dropped',
      6: 'plan_to_watch'
    }
    const status = statusMap[statusNum] || 'plan_to_watch'

    items.push({
      node: { id, title, num_episodes: numEp },
      list_status: {
        status,
        score,
        num_episodes_watched: epWatched,
        last_updated_at: new Date().toISOString()
      }
    })
  })

  return items
}
