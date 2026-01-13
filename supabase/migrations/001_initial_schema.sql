-- PizzaDAO Mixtape Database Schema
-- This migration creates the core tables for the mixtape application

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table: tracks wallet addresses, ENS names, and aggregated stats
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  wallet_address TEXT UNIQUE NOT NULL,
  ens_name TEXT,
  total_listening_time INTEGER DEFAULT 0, -- Total listening time in seconds
  mixtapes_owned INTEGER DEFAULT 0, -- Cached count from blockchain
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for faster lookups
CREATE INDEX idx_users_wallet ON users(wallet_address);
CREATE INDEX idx_users_listening_time ON users(total_listening_time DESC);
CREATE INDEX idx_users_ens ON users(ens_name);

-- Purchases table: tracks USDC payments and NFT mints
CREATE TABLE purchases (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  wallet_address TEXT NOT NULL,
  amount_usdc DECIMAL(18, 6) NOT NULL, -- USDC amount (e.g., 4.20)
  usdc_tx_hash TEXT NOT NULL UNIQUE, -- USDC transfer transaction hash
  mint_tx_hash TEXT UNIQUE, -- NFT mint transaction hash (nullable until minted)
  quantity INTEGER DEFAULT 1, -- Number of mixtapes purchased
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'minted', 'failed')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for purchases
CREATE INDEX idx_purchases_wallet ON purchases(wallet_address);
CREATE INDEX idx_purchases_status ON purchases(status);
CREATE INDEX idx_purchases_usdc_tx ON purchases(usdc_tx_hash);
CREATE INDEX idx_purchases_user_id ON purchases(user_id);

-- Listening sessions table: tracks individual listening sessions
CREATE TABLE listening_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  wallet_address TEXT NOT NULL,
  duration_seconds INTEGER NOT NULL DEFAULT 0, -- Session duration in seconds
  started_at TIMESTAMPTZ NOT NULL,
  ended_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for listening sessions
CREATE INDEX idx_listening_sessions_user ON listening_sessions(user_id);
CREATE INDEX idx_listening_sessions_wallet ON listening_sessions(wallet_address);
CREATE INDEX idx_listening_sessions_started_at ON listening_sessions(started_at DESC);

-- Mixtape metadata table: stores information about the mixtape
CREATE TABLE mixtape_metadata (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  token_id INTEGER UNIQUE DEFAULT 1, -- ERC-1155 token ID
  title TEXT NOT NULL,
  artist TEXT NOT NULL,
  description TEXT,
  cover_image_url TEXT, -- Supabase storage URL
  audio_file_url TEXT NOT NULL, -- Supabase storage URL
  duration_seconds INTEGER,
  track_count INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Row Level Security (RLS) Policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE listening_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE mixtape_metadata ENABLE ROW LEVEL SECURITY;

-- Users table policies
-- Anyone can read user data (for leaderboard)
CREATE POLICY "Users are viewable by everyone"
  ON users FOR SELECT
  USING (true);

-- Users can update their own row (for updating ENS name, etc.)
CREATE POLICY "Users can update own data"
  ON users FOR UPDATE
  USING (wallet_address = current_setting('request.jwt.claims', true)::json->>'wallet_address');

-- Purchases table policies
-- Users can view their own purchases
CREATE POLICY "Users can view own purchases"
  ON purchases FOR SELECT
  USING (wallet_address = current_setting('request.jwt.claims', true)::json->>'wallet_address');

-- Service role can insert/update purchases (for backend)
CREATE POLICY "Service role can manage purchases"
  ON purchases FOR ALL
  USING (current_setting('request.jwt.claims', true)::json->>'role' = 'service_role');

-- Listening sessions policies
-- Users can view their own listening sessions
CREATE POLICY "Users can view own sessions"
  ON listening_sessions FOR SELECT
  USING (wallet_address = current_setting('request.jwt.claims', true)::json->>'wallet_address');

-- Users can insert their own listening sessions
CREATE POLICY "Users can create own sessions"
  ON listening_sessions FOR INSERT
  WITH CHECK (wallet_address = current_setting('request.jwt.claims', true)::json->>'wallet_address');

-- Service role can manage all sessions
CREATE POLICY "Service role can manage sessions"
  ON listening_sessions FOR ALL
  USING (current_setting('request.jwt.claims', true)::json->>'role' = 'service_role');

-- Mixtape metadata policies
-- Everyone can read mixtape metadata
CREATE POLICY "Mixtape metadata is viewable by everyone"
  ON mixtape_metadata FOR SELECT
  USING (true);

-- Only service role can update metadata
CREATE POLICY "Service role can manage metadata"
  ON mixtape_metadata FOR ALL
  USING (current_setting('request.jwt.claims', true)::json->>'role' = 'service_role');

-- Functions and Triggers

-- Function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_purchases_updated_at BEFORE UPDATE ON purchases
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_mixtape_metadata_updated_at BEFORE UPDATE ON mixtape_metadata
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to increment listening time
CREATE OR REPLACE FUNCTION increment_listening_time(user_address TEXT, seconds INTEGER)
RETURNS VOID AS $$
BEGIN
  INSERT INTO users (wallet_address, total_listening_time)
  VALUES (user_address, seconds)
  ON CONFLICT (wallet_address)
  DO UPDATE SET
    total_listening_time = users.total_listening_time + seconds,
    updated_at = NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get or create user by wallet address
CREATE OR REPLACE FUNCTION get_or_create_user(user_wallet TEXT)
RETURNS UUID AS $$
DECLARE
  user_uuid UUID;
BEGIN
  INSERT INTO users (wallet_address)
  VALUES (user_wallet)
  ON CONFLICT (wallet_address) DO NOTHING;

  SELECT id INTO user_uuid FROM users WHERE wallet_address = user_wallet;
  RETURN user_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Insert default mixtape metadata
INSERT INTO mixtape_metadata (token_id, title, artist, description, audio_file_url, cover_image_url)
VALUES (
  1,
  'PizzaDAO Mixtape Vol. 1',
  'PizzaDAO',
  'The official PizzaDAO Mixtape - A collection of tracks curated by the DAO',
  'mixtape.mp3', -- Update this after uploading to Supabase Storage
  'https://your-project.supabase.co/storage/v1/object/public/mixtape-covers/mixtape-vol-1.jpg' -- Update with your Supabase URL
);
