-- Run this SQL in your Supabase SQL Editor to set up the database schema

-- Enable pgcrypto extension for UUID generation
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Create users table (matches Drizzle schema exactly)
CREATE TABLE IF NOT EXISTS users (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid()::text,
  username TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  refresh_token_hash TEXT,
  refresh_token_jti TEXT,
  refresh_token_expires_at TIMESTAMP WITH TIME ZONE
);

-- Create snippets table (matches Drizzle schema exactly)
CREATE TABLE IF NOT EXISTS snippets (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid()::text,
  user_id VARCHAR NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  code TEXT NOT NULL,
  language TEXT NOT NULL,
  tags TEXT[] DEFAULT ARRAY[]::text[],
  embedding TEXT,
  framework TEXT,
  complexity TEXT,
  is_public BOOLEAN DEFAULT FALSE,
  is_favorite BOOLEAN DEFAULT FALSE,
  usage_count INTEGER DEFAULT 0,
  last_used_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create collections table (matches Drizzle schema exactly)
CREATE TABLE IF NOT EXISTS collections (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid()::text,
  user_id VARCHAR NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  color TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_snippets_user_created ON snippets(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_snippets_user_language ON snippets(user_id, language);
CREATE INDEX IF NOT EXISTS idx_snippets_user_favorite ON snippets(user_id, is_favorite);
CREATE INDEX IF NOT EXISTS idx_snippets_user_last_used ON snippets(user_id, last_used_at DESC);
CREATE INDEX IF NOT EXISTS idx_collections_user ON collections(user_id);
