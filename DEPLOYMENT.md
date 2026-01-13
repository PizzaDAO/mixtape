# 🚀 Deployment Guide

Complete step-by-step guide to deploy the PizzaDAO Mixtape application.

## Prerequisites Checklist

- [ ] Node.js 18+ installed
- [ ] Foundry installed (`curl -L https://foundry.paradigm.xyz | bash`)
- [ ] Supabase CLI installed (`npm install -g supabase`)
- [ ] Vercel CLI installed (`npm install -g vercel`)
- [ ] WalletConnect Project ID from [cloud.walletconnect.com](https://cloud.walletconnect.com/)
- [ ] Supabase project created at [supabase.com](https://supabase.com/)
- [ ] Base ETH in deployer wallet (for gas)
- [ ] USDC in treasury wallet address

## Step 1: Deploy Smart Contract

### 1.1 Install Contract Dependencies

```bash
cd contracts
forge install OpenZeppelin/openzeppelin-contracts
```

### 1.2 Configure Environment

Create `contracts/.env`:

```bash
DEPLOYER_PRIVATE_KEY=0xyour_deployer_private_key_here
MINTER_WALLET_ADDRESS=0xyour_backend_wallet_address_here
BASESCAN_API_KEY=your_basescan_api_key
BASE_RPC_URL=https://mainnet.base.org
```

**Important**: The minter wallet will be used by Supabase edge functions to mint NFTs.

### 1.3 Update Metadata URI

Edit `contracts/script/Deploy.s.sol` and update the metadata URI:

```solidity
string memory metadataURI = "ipfs://YOUR_IPFS_CID/metadata.json";
// Or use a data URI or HTTPS URL
```

### 1.4 Test on Sepolia First

```bash
forge script script/Deploy.s.sol:DeployScript \
  --rpc-url https://sepolia.base.org \
  --broadcast \
  --verify
```

**Save the contract address from the output!**

### 1.5 Deploy to Mainnet

```bash
forge script script/Deploy.s.sol:DeployScript \
  --rpc-url $BASE_RPC_URL \
  --broadcast \
  --verify
```

### 1.6 Verify Deployment

Visit BaseScan and confirm:
- Contract is verified ✅
- Minter is authorized ✅
- Ownership is correct ✅

URL: `https://basescan.org/address/YOUR_CONTRACT_ADDRESS`

---

## Step 2: Set Up Supabase

### 2.1 Link Project

```bash
supabase link --project-ref your-project-ref
```

Get project ref from Supabase dashboard URL.

### 2.2 Run Database Migration

```bash
supabase db push
```

This creates all tables, RLS policies, and functions.

### 2.3 Create Storage Buckets

```bash
# Private bucket for audio files
supabase storage create mixtape-audio --public false

# Public bucket for cover art
supabase storage create mixtape-covers --public true
```

### 2.4 Upload Audio File

1. Go to Supabase dashboard → Storage → `mixtape-audio`
2. Upload your mixtape audio file (e.g., `mixtape.mp3`)
3. Note the file path (e.g., `mixtape.mp3`)

### 2.5 Upload Cover Art (Optional)

1. Go to Storage → `mixtape-covers`
2. Upload cover image (e.g., `cover.jpg`)
3. Get the public URL

### 2.6 Update Mixtape Metadata

Go to Supabase SQL Editor and run:

```sql
UPDATE mixtape_metadata
SET
  title = 'PizzaDAO Mixtape Vol. 1',
  artist = 'PizzaDAO',
  description = 'The official PizzaDAO Mixtape',
  audio_file_url = 'mixtape.mp3', -- Just the filename
  cover_image_url = 'https://YOUR_PROJECT.supabase.co/storage/v1/object/public/mixtape-covers/cover.jpg',
  duration_seconds = 3600, -- Update with actual duration
  track_count = 12 -- Update with actual track count
WHERE token_id = 1;
```

### 2.7 Deploy Edge Functions

```bash
cd supabase/functions

# Deploy all functions
supabase functions deploy mint-mixtape
supabase functions deploy verify-ownership
```

### 2.8 Set Edge Function Secrets

```bash
supabase secrets set MINTER_PRIVATE_KEY=0xyour_minter_wallet_private_key
supabase secrets set NFT_CONTRACT_ADDRESS=0xyour_deployed_nft_contract
supabase secrets set TREASURY_ADDRESS=0xyour_treasury_wallet
supabase secrets set BASE_RPC_URL=https://mainnet.base.org
```

**Critical**: Use the same minter wallet that was authorized in the smart contract!

### 2.9 Test Edge Functions

```bash
# Test mint-mixtape (requires valid USDC transaction)
curl -X POST https://YOUR_PROJECT.supabase.co/functions/v1/mint-mixtape \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{"userAddress":"0x...","usdcTxHash":"0x..."}'

# Test verify-ownership
curl -X POST https://YOUR_PROJECT.supabase.co/functions/v1/verify-ownership \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{"userAddress":"0x..."}'
```

---

## Step 3: Configure Frontend

### 3.1 Create .env.local

In the root directory, create `.env.local`:

```bash
# Frontend
NEXT_PUBLIC_USDC_ADDRESS=0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913
NEXT_PUBLIC_NFT_CONTRACT_ADDRESS=0xYOUR_DEPLOYED_CONTRACT_HERE
NEXT_PUBLIC_TREASURY_ADDRESS=0xYOUR_TREASURY_WALLET_HERE
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_walletconnect_project_id
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3.2 Test Locally

```bash
npm install
npm run dev
```

Visit http://localhost:3000 and test:
- [ ] Wallet connection works
- [ ] Purchase flow displays correctly
- [ ] All pages load without errors

### 3.3 Build for Production

```bash
npm run build
```

Fix any TypeScript errors or build issues.

---

## Step 4: Deploy to Vercel

### 4.1 Initialize Vercel Project

```bash
vercel
```

Follow the prompts to link your project.

### 4.2 Add Environment Variables

In Vercel dashboard:
1. Go to Project Settings → Environment Variables
2. Add all variables from `.env.local`
3. Set scope to Production, Preview, and Development

### 4.3 Deploy

```bash
vercel --prod
```

### 4.4 Verify Deployment

Visit your production URL and test:
- [ ] Wallet connection (Base mainnet)
- [ ] Purchase with real USDC (small test amount first!)
- [ ] NFT minting
- [ ] Audio playback
- [ ] Listening time tracking
- [ ] Leaderboard display

---

## Step 5: Post-Deployment

### 5.1 Monitor Edge Functions

Check Supabase dashboard → Edge Functions → Logs for any errors.

### 5.2 Test Full Flow

1. Connect wallet with Base ETH and USDC
2. Purchase mixtape for $4.20 USDC
3. Wait for NFT mint confirmation
4. Navigate to player
5. Verify audio loads
6. Play for 1+ minutes
7. Check leaderboard for your entry

### 5.3 Set Up Monitoring

- **Sentry**: For frontend error tracking
- **Supabase Logs**: For backend monitoring
- **BaseScan**: For contract activity

### 5.4 Create Backup

```bash
# Backup database
supabase db dump -f backup_$(date +%Y%m%d).sql
```

---

## Troubleshooting

### Contract Deployment Failed

**Error**: Insufficient funds
- **Solution**: Add more Base ETH to deployer wallet

**Error**: Nonce too low
- **Solution**: Reset your wallet nonce or wait for pending transactions

### Edge Function Errors

**Error**: "Failed to mint NFT"
- Check minter wallet is authorized in contract
- Verify minter private key is correct in secrets
- Ensure minter wallet has Base ETH for gas

**Error**: "Transaction not found"
- USDC transaction may not be confirmed yet
- Check transaction hash on BaseScan

### Frontend Issues

**Error**: "Failed to load audio"
- Verify audio file is uploaded to Supabase Storage
- Check edge function is deployed
- Ensure NFT ownership is correct

**Error**: Wallet won't connect
- Check WalletConnect Project ID is correct
- Try different browser
- Clear browser cache

---

## Maintenance

### Regular Tasks

- **Monitor storage usage** - Supabase has limits
- **Check edge function logs** - Look for errors
- **Review leaderboard** - Ensure data is accurate
- **Update dependencies** - Keep packages current

### Updating Smart Contract

You cannot update deployed contracts. To make changes:
1. Deploy new contract version
2. Update frontend with new contract address
3. Consider migration strategy for existing NFT holders

### Scaling Considerations

- **RPC Rate Limits**: Consider using Alchemy or Infura
- **Supabase Storage**: Upgrade plan if needed
- **Edge Function Concurrency**: Monitor and upgrade
- **Database Connections**: Watch for connection pool limits

---

## Security Checklist

- [ ] Private keys stored securely (never in git)
- [ ] Environment variables set correctly
- [ ] RLS policies enabled on all tables
- [ ] Edge function secrets configured
- [ ] Treasury wallet secured (hardware wallet recommended)
- [ ] Minter wallet secured
- [ ] Contract verified on BaseScan
- [ ] Test on testnet before mainnet
- [ ] Backup database regularly

---

## Support

If you encounter issues:
1. Check logs (Vercel, Supabase, BaseScan)
2. Review this guide again
3. Test on Base Sepolia testnet
4. Open GitHub issue with detailed error info

---

**Congratulations!** 🎉 Your PizzaDAO Mixtape platform is now live!
