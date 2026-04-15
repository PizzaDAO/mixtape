import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { createPublicClient, http } from 'https://esm.sh/viem@2.44.1';
import { base } from 'https://esm.sh/viem@2.44.1/chains';

// Contract addresses and configuration
const NFT_CONTRACT_ADDRESS = Deno.env.get('NFT_CONTRACT_ADDRESS') || '';
const BASE_RPC_URL = Deno.env.get('BASE_RPC_URL') || 'https://mainnet.base.org';
const MIXTAPE_TOKEN_ID = 1;

const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// NFT ABI
const MIXTAPE_NFT_ABI = [
  {
    inputs: [
      { internalType: 'address', name: 'account', type: 'address' },
      { internalType: 'uint256', name: 'id', type: 'uint256' },
    ],
    name: 'balanceOf',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
] as const;

/**
 * Extract the storage path from an audio_file_url.
 *
 * Accepted formats:
 *   - Full Supabase URL: https://project.supabase.co/storage/v1/object/public/bucket/path/to/file.mp3
 *   - Relative path within the bucket: path/to/file.mp3  (or just file.mp3)
 *
 * For full URLs we strip everything up to and including the bucket name
 * so that subdirectory structure is preserved.
 */
function extractAudioPath(rawUrl: string): string {
  if (rawUrl.includes('storage/v1/object')) {
    // Full URL — find the bucket segment and return everything after it
    // Pattern: .../storage/v1/object/public/<bucket>/<path...>
    //       or .../storage/v1/object/sign/<bucket>/<path...>
    const regex = /storage\/v1\/object\/(?:public|sign)\/[^/]+\/(.+)/;
    const match = rawUrl.match(regex);
    if (match) {
      return match[1];
    }
    // Fallback: return the last segment (old behaviour) if regex didn't match
    return rawUrl.split('/').slice(-1)[0];
  }
  // Already a relative path
  return rawUrl;
}

serve(async (req) => {
  // CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: CORS_HEADERS });
  }

  try {
    // Validate NFT contract address is configured and not zero
    if (!NFT_CONTRACT_ADDRESS || NFT_CONTRACT_ADDRESS === ZERO_ADDRESS) {
      console.error('NFT_CONTRACT_ADDRESS is not set or is the zero address');
      return new Response(
        JSON.stringify({ error: 'Server configuration error: NFT contract address not set' }),
        { status: 500, headers: { 'Content-Type': 'application/json', ...CORS_HEADERS } }
      );
    }

    // Parse request body
    const { userAddress } = await req.json();

    if (!userAddress) {
      return new Response(
        JSON.stringify({ error: 'Missing required parameter: userAddress' }),
        { status: 400, headers: { 'Content-Type': 'application/json', ...CORS_HEADERS } }
      );
    }

    console.log(`Verifying ownership for ${userAddress}`);

    // Create public client to check NFT balance
    const publicClient = createPublicClient({
      chain: base,
      transport: http(BASE_RPC_URL),
    });

    // Check NFT balance
    const balance = await publicClient.readContract({
      address: NFT_CONTRACT_ADDRESS as `0x${string}`,
      abi: MIXTAPE_NFT_ABI,
      functionName: 'balanceOf',
      args: [userAddress as `0x${string}`, BigInt(MIXTAPE_TOKEN_ID)],
    });

    console.log(`NFT balance for ${userAddress}: ${balance}`);

    // Check if user owns at least 1 NFT
    if (balance === BigInt(0)) {
      return new Response(
        JSON.stringify({
          authorized: false,
          message: 'User does not own the mixtape NFT',
        }),
        {
          status: 403,
          headers: { 'Content-Type': 'application/json', ...CORS_HEADERS },
        }
      );
    }

    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get mixtape metadata to retrieve audio file path
    const { data: metadata, error: metadataError } = await supabaseClient
      .from('mixtape_metadata')
      .select('audio_file_url')
      .eq('token_id', MIXTAPE_TOKEN_ID)
      .single();

    if (metadataError || !metadata) {
      console.error('Error fetching mixtape metadata:', metadataError);
      return new Response(
        JSON.stringify({ error: 'Mixtape metadata not found' }),
        { status: 404, headers: { 'Content-Type': 'application/json', ...CORS_HEADERS } }
      );
    }

    // Extract the storage path, preserving subdirectory structure
    const audioPath = extractAudioPath(metadata.audio_file_url);

    // Generate signed URL for audio file (1 hour expiry)
    const { data: signedUrlData, error: signedUrlError } = await supabaseClient.storage
      .from('mixtape-audio')
      .createSignedUrl(audioPath, 3600); // 1 hour expiry

    if (signedUrlError || !signedUrlData) {
      console.error('Error creating signed URL:', signedUrlError);
      return new Response(
        JSON.stringify({ error: 'Failed to generate audio URL' }),
        { status: 500, headers: { 'Content-Type': 'application/json', ...CORS_HEADERS } }
      );
    }

    console.log(`Generated signed URL for ${userAddress}`);

    // Update user's mixtapes_owned count (cache blockchain data)
    await supabaseClient
      .from('users')
      .upsert({
        wallet_address: userAddress.toLowerCase(),
        mixtapes_owned: Number(balance),
        updated_at: new Date().toISOString(),
      })
      .eq('wallet_address', userAddress.toLowerCase());

    return new Response(
      JSON.stringify({
        authorized: true,
        audioUrl: signedUrlData.signedUrl,
        balance: Number(balance),
        message: 'Access granted',
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json', ...CORS_HEADERS },
      }
    );
  } catch (error) {
    console.error('Error in verify-ownership function:', error);
    return new Response(
      JSON.stringify({
        error: 'Internal server error',
        details: error.message,
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...CORS_HEADERS },
      }
    );
  }
});
