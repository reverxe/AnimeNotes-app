import { supabaseAdmin } from './supabase'
import { UserProfile, AnimeNote, AnimeListItem } from '@/types'

/**
 * Create or update user profile
 */
export async function upsertUser(
  malUserId: number,
  malUsername: string,
  accessToken: string,
  refreshToken: string,
  tokenExpiresAt: Date,
  email?: string
): Promise<UserProfile> {
  const { data, error } = await supabaseAdmin
    .from('users')
    .upsert(
      {
        mal_user_id: malUserId,
        mal_username: malUsername,
        email: email || null,
        access_token: accessToken,
        refresh_token: refreshToken,
        token_expires_at: tokenExpiresAt.toISOString(),
        last_synced_at: new Date().toISOString()
      },
      { onConflict: 'mal_user_id' }
    )
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to upsert user: ${error.message}`)
  }

  return data
}

/**
 * Get user by ID
 */
export async function getUserById(userId: string): Promise<UserProfile | null> {
  const { data, error } = await supabaseAdmin
    .from('users')
    .select('*')
    .eq('id', userId)
    .single()

  if (error) {
    if (error.code === 'PGRST116') return null // Not found
    throw new Error(`Failed to fetch user: ${error.message}`)
  }

  return data
}

/**
 * Update user token expiration
 */
export async function updateUserTokens(
  userId: string,
  accessToken: string,
  refreshToken: string,
  tokenExpiresAt: Date
): Promise<void> {
  const { error } = await supabaseAdmin
    .from('users')
    .update({
      access_token: accessToken,
      refresh_token: refreshToken,
      token_expires_at: tokenExpiresAt.toISOString(),
      updated_at: new Date().toISOString()
    })
    .eq('id', userId)

  if (error) {
    throw new Error(`Failed to update tokens: ${error.message}`)
  }
}

/**
 * Save anime list items for user
 */
export async function saveAnimeList(
  userId: string,
  animeItems: AnimeListItem[]
): Promise<void> {
  const animeToSave = animeItems.map(item => ({
    user_id: userId,
    anime_id: item.node.id,
    title: item.node.title,
    mal_picture_small: item.node.main_picture?.small,
    mal_picture_large: item.node.main_picture?.large,
    status: item.list_status.status,
    score: item.list_status.score,
    num_episodes_watched: item.list_status.num_episodes_watched,
    num_episodes: item.node.num_episodes,
    last_updated_at: item.list_status.last_updated_at
  }))

  const { error } = await supabaseAdmin
    .from('anime_list')
    .upsert(animeToSave, { onConflict: 'user_id,anime_id' })

  if (error) {
    throw new Error(`Failed to save anime list: ${error.message}`)
  }
}

/**
 * Get user's anime list
 */
export async function getUserAnimeList(userId: string, limit = 50, offset = 0) {
  const { data, error, count } = await supabaseAdmin
    .from('anime_list')
    .select('*', { count: 'exact' })
    .eq('user_id', userId)
    .order('updated_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (error) {
    throw new Error(`Failed to fetch anime list: ${error.message}`)
  }

  return { data, count }
}

/**
 * Get single anime from list
 */
export async function getAnimeListItem(userId: string, animeId: number) {
  const { data, error } = await supabaseAdmin
    .from('anime_list')
    .select('*')
    .eq('user_id', userId)
    .eq('anime_id', animeId)
    .single()

  if (error) {
    if (error.code === 'PGRST116') return null // Not found
    throw new Error(`Failed to fetch anime: ${error.message}`)
  }

  return data
}

/**
 * Create note for an episode
 */
export async function createNote(
  userId: string,
  animeId: number,
  episodeNumber: number,
  content: string
): Promise<AnimeNote> {
  const { data, error } = await supabaseAdmin
    .from('notes')
    .upsert({
      user_id: userId,
      anime_id: animeId,
      episode_number: episodeNumber,
      content,
      updated_at: new Date().toISOString()
    })
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to create note: ${error.message}`)
  }

  return data
}

/**
 * Get notes for an anime
 */
export async function getAnimeNotes(userId: string, animeId: number): Promise<AnimeNote[]> {
  const { data, error } = await supabaseAdmin
    .from('notes')
    .select('*')
    .eq('user_id', userId)
    .eq('anime_id', animeId)
    .order('episode_number', { ascending: true })

  if (error) {
    throw new Error(`Failed to fetch notes: ${error.message}`)
  }

  return data || []
}

/**
 * Get single note
 */
export async function getNote(
  userId: string,
  animeId: number,
  episodeNumber: number
): Promise<AnimeNote | null> {
  const { data, error } = await supabaseAdmin
    .from('notes')
    .select('*')
    .eq('user_id', userId)
    .eq('anime_id', animeId)
    .eq('episode_number', episodeNumber)
    .single()

  if (error) {
    if (error.code === 'PGRST116') return null // Not found
    throw new Error(`Failed to fetch note: ${error.message}`)
  }

  return data
}

/**
 * Delete note
 */
export async function deleteNote(
  userId: string,
  animeId: number,
  episodeNumber: number
): Promise<void> {
  const { error } = await supabaseAdmin
    .from('notes')
    .delete()
    .eq('user_id', userId)
    .eq('anime_id', animeId)
    .eq('episode_number', episodeNumber)

  if (error) {
    throw new Error(`Failed to delete note: ${error.message}`)
  }
}

/**
 * Get all user notes (paginated)
 */
export async function getUserNotes(userId: string, limit = 50, offset = 0) {
  const { data, error, count } = await supabaseAdmin
    .from('notes')
    .select('*', { count: 'exact' })
    .eq('user_id', userId)
    .order('updated_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (error) {
    throw new Error(`Failed to fetch user notes: ${error.message}`)
  }

  return { data, count }
}
