import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { createPublicClient, createWalletClient, http, parseAbiItem } from 'https://esm.sh/viem@2.44.1';
import { privateKeyToAccount } from 'https://esm.sh/viem@2.44.1/accounts';
import { base } from 'https://esm.sh/viem@2.44.1/chains';

// Contract addresses and configuration
const USDC_ADDRESS = '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913';
const TREASURY_ADDRESS = Deno.env.get('TREASURY_ADDRESS') || '';
const NFT_CONTRACT_ADDRESS = Deno.env.get('NFT_CONTRACT_ADDRESS') || '';
const MINTER_PRIVATE_KEY = Deno.env.get('MINTER_PRIVATE_KEY') || '';
const BASE_RPC_URL = Deno.env.get('BASE_RPC_URL') || 'https://mainnet.base.org';

// USDC has 6 decimals
const USDC_DECIMALS = 6;
const EXPECTED_AMOUNT = BigInt(4.20 * 10 ** USDC_DECIMALS); // 4,200,000

// ABIs
const MIXTAPE_NFT_ABI = [
  {
    inputs: [
      { internalType: 'address', name: 'to', type: 'address' },
      { internalType: 'uint256', name: 'amount', type: 'uint256' },
    ],
    name: 'mint',
    outputs: [],
    stateMutability: 'nonpayable',
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
    const { userAddress, usdcTxHash } = await req.json();

    if (!userAddress || !usdcTxHash) {
      return new Response(
        JSON.stringify({ error: 'Missing required parameters: userAddress and usdcTxHash' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Processing mint request for ${userAddress}, tx: ${usdcTxHash}`);

    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Check if this transaction has already been processed
    const { data: existingPurchase } = await supabaseClient
      .from('purchases')
      .select('*')
      .eq('usdc_tx_hash', usdcTxHash)
      .single();

    if (existingPurchase) {
      if (existingPurchase.status === 'minted') {
        return new Response(
          JSON.stringify({
            success: true,
            mintTxHash: existingPurchase.mint_tx_hash,
            message: 'NFT already minted for this transaction',
          }),
          { status: 200, headers: { 'Content-Type': 'application/json' } }
        );
      }
    }

    // Create public client to verify transaction
    const publicClient = createPublicClient({
      chain: base,
      transport: http(BASE_RPC_URL),
    });

    // Get transaction receipt
    const receipt = await publicClient.getTransactionReceipt({
      hash: usdcTxHash as `0x${string}`,
    });

    if (!receipt) {
      return new Response(
        JSON.stringify({ error: 'Transaction not found or not confirmed' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Verify transaction was successful
    if (receipt.status !== 'success') {
      return new Response(
        JSON.stringify({ error: 'Transaction failed' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Parse Transfer event from USDC contract
    // Transfer event signature: Transfer(address indexed from, address indexed to, uint256 value)
    const transferEventSignature = parseAbiItem('event Transfer(address indexed from, address indexed to, uint256 value)');

    const transferLog = receipt.logs.find((log) => {
      return (
        log.address.toLowerCase() === USDC_ADDRESS.toLowerCase() &&
        log.topics[0] === transferEventSignature.selector
      );
    });

    if (!transferLog) {
      return new Response(
        JSON.stringify({ error: 'No USDC transfer found in transaction' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Decode transfer event
    const decodedLog = publicClient.decodeEventLog({
      abi: [transferEventSignature],
      data: transferLog.data,
      topics: transferLog.topics,
    });

    const { from, to, value } = decodedLog.args;

    // Verify recipient is treasury
    if (to.toLowerCase() !== TREASURY_ADDRESS.toLowerCase()) {
      return new Response(
        JSON.stringify({
          error: `Invalid recipient. Expected ${TREASURY_ADDRESS}, got ${to}`,
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Verify amount is 4.20 USDC (with small tolerance for rounding)
    const amountDiff = value > EXPECTED_AMOUNT ? value - EXPECTED_AMOUNT : EXPECTED_AMOUNT - value;
    const tolerance = BigInt(1000); // 0.001 USDC tolerance

    if (amountDiff > tolerance) {
      return new Response(
        JSON.stringify({
          error: `Invalid amount. Expected ${EXPECTED_AMOUNT}, got ${value}`,
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    console.log(`USDC transfer verified: ${from} -> ${to}, amount: ${value}`);

    // Mint NFT
    const account = privateKeyToAccount(MINTER_PRIVATE_KEY as `0x${string}`);
    const walletClient = createWalletClient({
      account,
      chain: base,
      transport: http(BASE_RPC_URL),
    });

    console.log(`Minting NFT to ${userAddress}...`);

    const mintTxHash = await walletClient.writeContract({
      address: NFT_CONTRACT_ADDRESS as `0x${string}`,
      abi: MIXTAPE_NFT_ABI,
      functionName: 'mint',
      args: [userAddress as `0x${string}`, BigInt(1)], // Mint 1 mixtape
    });

    console.log(`Mint transaction sent: ${mintTxHash}`);

    // Wait for mint transaction to be confirmed
    await publicClient.waitForTransactionReceipt({
      hash: mintTxHash,
    });

    console.log(`Mint transaction confirmed: ${mintTxHash}`);

    // Get or create user
    const { data: userData } = await supabaseClient.rpc('get_or_create_user', {
      user_wallet: userAddress.toLowerCase(),
    });

    // Record purchase in database
    if (existingPurchase) {
      // Update existing purchase
      await supabaseClient
        .from('purchases')
        .update({
          mint_tx_hash: mintTxHash,
          status: 'minted',
          updated_at: new Date().toISOString(),
        })
        .eq('usdc_tx_hash', usdcTxHash);
    } else {
      // Create new purchase record
      await supabaseClient.from('purchases').insert({
        user_id: userData,
        wallet_address: userAddress.toLowerCase(),
        amount_usdc: 4.20,
        usdc_tx_hash: usdcTxHash,
        mint_tx_hash: mintTxHash,
        quantity: 1,
        status: 'minted',
      });
    }

    // Update user's mixtapes_owned count
    await supabaseClient
      .from('users')
      .update({
        mixtapes_owned: 1, // For now, just set to 1. In production, fetch from blockchain
        updated_at: new Date().toISOString(),
      })
      .eq('wallet_address', userAddress.toLowerCase());

    return new Response(
      JSON.stringify({
        success: true,
        mintTxHash,
        message: 'NFT minted successfully',
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
    console.error('Error in mint-mixtape function:', error);
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
