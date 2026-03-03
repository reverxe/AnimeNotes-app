// MyAnimeList OAuth Types
export interface MALOAuthTokens {
  access_token: string
  refresh_token: string
  expires_in: number
  token_type: string
}

export interface MALOAuthResponse {
  access_token: string
  refresh_token?: string
  expires_in: number
  token_type: string
}

// User Types
export interface UserProfile {
  id: string
  mal_user_id: number
  mal_username: string
  email: string | null
  created_at: string
  updated_at: string
}

// Anime Types
export interface AnimeListItem {
  node: {
    id: number
    title: string
    main_picture?: {
      small: string
      large: string
    }
    num_episodes?: number
  }
  list_status: {
    status: 'watching' | 'completed' | 'on_hold' | 'dropped' | 'plan_to_watch'
    score: number
    num_episodes_watched: number
    last_updated_at: string
  }
}

export interface AnimeDetails {
  id: number
  title: string
  main_picture?: {
    small: string
    large: string
  }
  synopsis?: string
  num_episodes?: number
  status?: string
  aired?: {
    from?: string
    to?: string
  }
  genres?: Array<{
    id: number
    name: string
  }>
}

export interface Episode {
  id: number
  anime_id: number
  episode_number: number
  title: string
  aired?: string
}

// Notes Types
export interface AnimeNote {
  id: string
  user_id: string
  anime_id: number
  episode_number: number
  content: string
  created_at: string
  updated_at: string
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  paging: {
    previous?: string
    next?: string
  }
}
