-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table - stores MyAnimeList profile information
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  mal_user_id INTEGER UNIQUE NOT NULL,
  mal_username VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  access_token VARCHAR(1000) NOT NULL,
  refresh_token VARCHAR(1000),
  token_expires_at TIMESTAMP NOT NULL,
  last_synced_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Anime cache table - stores user's anime list from MyAnimeList
CREATE TABLE anime_list (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  anime_id INTEGER NOT NULL,
  title VARCHAR(500) NOT NULL,
  mal_picture_small VARCHAR(500),
  mal_picture_large VARCHAR(500),
  status VARCHAR(50) NOT NULL, -- watching, completed, on_hold, dropped, plan_to_watch
  score INTEGER,
  num_episodes_watched INTEGER,
  num_episodes INTEGER,
  synopsis TEXT,
  last_updated_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, anime_id)
);

-- Notes table - personal notes per-episode
CREATE TABLE notes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  anime_id INTEGER NOT NULL,
  episode_number INTEGER NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, anime_id, episode_number)
);

-- Create indexes for better query performance
CREATE INDEX idx_users_mal_user_id ON users(mal_user_id);
CREATE INDEX idx_anime_list_user_id ON anime_list(user_id);
CREATE INDEX idx_anime_list_anime_id ON anime_list(anime_id);
CREATE INDEX idx_notes_user_id ON notes(user_id);
CREATE INDEX idx_notes_user_anime ON notes(user_id, anime_id);
CREATE INDEX idx_notes_user_anime_episode ON notes(user_id, anime_id, episode_number);

-- Row Level Security (RLS) Policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE anime_list ENABLE ROW LEVEL SECURITY;
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;

-- Users table - allow users to view/update only their own data
CREATE POLICY "Users can view their own profile"
  ON users FOR SELECT
  USING (auth.uid()::text = id::text);

CREATE POLICY "Users can update their own profile"
  ON users FOR UPDATE
  USING (auth.uid()::text = id::text);

-- Anime list table - allow users to view their own list
CREATE POLICY "Users can view their own anime list"
  ON anime_list FOR SELECT
  USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can insert their anime list"
  ON anime_list FOR INSERT
  WITH CHECK (auth.uid()::text = user_id::text);

CREATE POLICY "Users can update their anime list"
  ON anime_list FOR UPDATE
  USING (auth.uid()::text = user_id::text);

-- Notes table - allow users to manage only their own notes
CREATE POLICY "Users can view their own notes"
  ON notes FOR SELECT
  USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can insert their notes"
  ON notes FOR INSERT
  WITH CHECK (auth.uid()::text = user_id::text);

CREATE POLICY "Users can update their notes"
  ON notes FOR UPDATE
  USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can delete their notes"
  ON notes FOR DELETE
  USING (auth.uid()::text = user_id::text);
