# Supabase Setup for PizzaDAO Mixtape

This directory contains database migrations and edge functions for the PizzaDAO Mixtape application.

## Prerequisites

- [Supabase CLI](https://supabase.com/docs/guides/cli) installed
- Supabase project created

## Initial Setup

1. Link your Supabase project:

```bash
supabase link --project-ref your-project-ref
```

2. Run the migrations:

```bash
supabase db push
```

3. Create storage buckets:

```bash
# Create bucket for audio files (private)
supabase storage create mixtape-audio --public false

# Create bucket for cover art (public)
supabase storage create mixtape-covers --public true
```

4. Upload audio and cover art to storage buckets:

**Audio File:**
- Go to Supabase dashboard → Storage → `mixtape-audio`
- Upload your mixtape audio file (e.g., `mixtape.mp3`)

**Cover Art:**
- Go to Storage → `mixtape-covers`
- Upload cover images from your `public` folder:
  - `mixtape-vol-1.jpg` (Cassette tape with Italian flag)
  - `mixtape-vol-2.png` (Pizza box with turntable)

5. Update the `mixtape_metadata` table with the correct URLs:

```sql
UPDATE mixtape_metadata
SET
  audio_file_url = 'mixtape.mp3',
  cover_image_url = 'https://your-project.supabase.co/storage/v1/object/public/mixtape-covers/mixtape-vol-1.jpg',
  duration_seconds = 3600, -- Update with actual duration
  track_count = 12 -- Update with actual track count
WHERE token_id = 1;
```

## Storage Bucket Policies

### mixtape-audio (Private)
Access controlled via edge functions - only NFT holders can get signed URLs.

### mixtape-covers (Public)
Anyone can view cover art.

## Edge Functions

### Deploy Edge Functions

```bash
# Deploy all functions
supabase functions deploy

# Deploy individual function
supabase functions deploy mint-mixtape
supabase functions deploy verify-ownership
supabase functions deploy update-listening-time
```

### Set Edge Function Secrets

```bash
supabase secrets set MINTER_PRIVATE_KEY=0xyour_private_key
supabase secrets set NFT_CONTRACT_ADDRESS=0xyour_nft_contract
supabase secrets set TREASURY_ADDRESS=0xyour_treasury_address
supabase secrets set BASE_RPC_URL=https://mainnet.base.org
```

## Database Functions

The migration includes several helper functions:

- `increment_listening_time(user_address TEXT, seconds INTEGER)` - Add listening time to user
- `get_or_create_user(user_wallet TEXT)` - Get or create user by wallet address

## Row Level Security (RLS)

RLS is enabled on all tables with the following policies:

- **users**: Public read, users can update own data
- **purchases**: Users can view own purchases, service role can manage all
- **listening_sessions**: Users can view/create own sessions, service role can manage all
- **mixtape_metadata**: Public read, service role can update

## Testing the Database

```sql
-- Check if tables exist
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public';

-- View mixtape metadata
SELECT * FROM mixtape_metadata;

-- View users (should be empty initially)
SELECT * FROM users;
```

## Backup

To backup your database:

```bash
supabase db dump -f backup.sql
```

To restore:

```bash
supabase db reset
supabase db push
```
