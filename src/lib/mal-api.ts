import axios from 'axios'
import { PaginatedResponse, AnimeListItem, AnimeDetails } from '@/types'

const MAL_API_BASE_URL = 'https://api.myanimelist.net/v2'

const malClient = axios.create({
  baseURL: MAL_API_BASE_URL,
  timeout: 10000
})

/**
 * Fetch user's anime list from MyAnimeList
 */
export async function fetchUserAnimeList(
  accessToken: string,
  limit = 100,
  offset = 0,
  fields = [
    'id',
    'title',
    'main_picture',
    'num_episodes',
    'status',
    'genres',
    'synopsis'
  ]
): Promise<PaginatedResponse<AnimeListItem>> {
  try {
    const response = await malClient.get('/users/@me/animelist', {
      headers: {
        Authorization: `Bearer ${accessToken}`
      },
      params: {
        limit,
        offset,
        fields: fields.join(','),
        nsfw: true
      }
    })

    return response.data
  } catch (error) {
    throw new Error(`Failed to fetch anime list: ${error}`)
  }
}

/**
 * Fetch anime details
 */
export async function fetchAnimeDetails(
  animeId: number,
  fields = [
    'id',
    'title',
    'main_picture',
    'synopsis',
    'num_episodes',
    'status',
    'aired',
    'genres'
  ]
): Promise<AnimeDetails> {
  try {
    const response = await malClient.get(`/anime/${animeId}`, {
      params: {
        fields: fields.join(','),
        nsfw: true
      }
    })

    return response.data
  } catch (error) {
    throw new Error(`Failed to fetch anime details: ${error}`)
  }
}

/**
 * Fetch anime forum (for discussions/reviews)
 */
export async function fetchAnimeForum(
  animeId: number,
  limit = 20,
  offset = 0
): Promise<any> {
  try {
    const response = await malClient.get(`/anime/${animeId}/forum`, {
      params: {
        limit,
        offset
      }
    })

    return response.data
  } catch (error) {
    throw new Error(`Failed to fetch anime forum: ${error}`)
  }
}

/**
 * Search anime by query
 */
export async function searchAnime(
  query: string,
  limit = 10,
  offset = 0,
  fields = ['id', 'title', 'main_picture', 'num_episodes', 'synopsis']
): Promise<PaginatedResponse<AnimeListItem>> {
  try {
    const response = await malClient.get('/anime', {
      params: {
        query,
        limit,
        offset,
        fields: fields.join(','),
        nsfw: true
      }
    })

    return response.data
  } catch (error) {
    throw new Error(`Failed to search anime: ${error}`)
  }
}

/**
 * Fetch anime statistics
 */
export async function fetchAnimeStats(animeId: number): Promise<any> {
  try {
    const response = await malClient.get(`/anime/${animeId}/statistics`)
    return response.data
  } catch (error) {
    throw new Error(`Failed to fetch anime stats: ${error}`)
  }
}

/**
 * Batch fetch anime details for multiple IDs
 */
export async function batchFetchAnimeDetails(
  animeIds: number[],
  fields = ['id', 'title', 'main_picture', 'synopsis', 'num_episodes']
): Promise<AnimeDetails[]> {
  const promises = animeIds.map(id =>
    fetchAnimeDetails(id, fields).catch(() => null)
  )

  const results = await Promise.all(promises)
  return results.filter((item): item is AnimeDetails => item !== null)
}
