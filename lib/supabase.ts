import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Check if Supabase is configured
export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

// Create client with placeholder values if not configured (prevents initialization errors)
export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-key'
);

// Types for database tables
export interface User {
  id: string;
  wallet_address: string;
  ens_name?: string;
  total_listening_time: number;
  mixtapes_owned: number;
  created_at: string;
  updated_at: string;
}

export interface Purchase {
  id: string;
  user_id: string;
  wallet_address: string;
  amount_usdc: number;
  usdc_tx_hash: string;
  mint_tx_hash?: string;
  quantity: number;
  status: 'pending' | 'minted' | 'failed';
  created_at: string;
  updated_at: string;
}

export interface ListeningSession {
  id: string;
  user_id: string;
  wallet_address: string;
  duration_seconds: number;
  started_at: string;
  ended_at?: string;
  created_at: string;
}

export interface MixtapeMetadata {
  id: string;
  token_id: number;
  title: string;
  artist: string;
  description?: string;
  cover_image_url?: string;
  audio_file_url: string;
  duration_seconds?: number;
  track_count?: number;
  created_at: string;
  updated_at: string;
}
