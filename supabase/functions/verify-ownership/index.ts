import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { createPublicClient, http } from 'https://esm.sh/viem@2.44.1';
import { base } from 'https://esm.sh/viem@2.44.1/chains';

// Contract addresses and configuration
const NFT_CONTRACT_ADDRESS = Deno.env.get('NFT_CONTRACT_ADDRESS') || '';
const BASE_RPC_URL = Deno.env.get('BASE_RPC_URL') || 'https://mainnet.base.org';
const MIXTAPE_TOKEN_ID = 1;

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

serve(async (req) => {
  // CORS headers
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
      },
    });
  }

  try {
    // Parse request body
    const { userAddress } = await req.json();

    if (!userAddress) {
      return new Response(
        JSON.stringify({ error: 'Missing required parameter: userAddress' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
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
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
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
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Extract bucket and path from audio_file_url
    // Expected format: https://project.supabase.co/storage/v1/object/public/bucket/path
    // or for private: just the path relative to the bucket
    const audioPath = metadata.audio_file_url.includes('storage/v1/object')
      ? metadata.audio_file_url.split('/').slice(-1)[0] // Get last segment
      : metadata.audio_file_url;

    // Generate signed URL for audio file (1 hour expiry)
    const { data: signedUrlData, error: signedUrlError } = await supabaseClient.storage
      .from('mixtape-audio')
      .createSignedUrl(audioPath, 3600); // 1 hour expiry

    if (signedUrlError || !signedUrlData) {
      console.error('Error creating signed URL:', signedUrlError);
      return new Response(
        JSON.stringify({ error: 'Failed to generate audio URL' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
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
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
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
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      }
    );
  }
});
