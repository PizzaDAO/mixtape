# 🍕 PizzaDAO Mixtape

A decentralized music streaming platform built on Base chain. Purchase mixtape NFTs with USDC, stream music, track listening time, and compete on the leaderboard.

## Features

- **NFT-Gated Access**: Purchase mixtapes as ERC-1155 NFTs on Base
- **USDC Payments**: Buy mixtapes for $4.20 USDC
- **Music Streaming**: Stream audio directly on the site with custom player
- **Listening Time Tracking**: Track and display listening time
- **Leaderboard**: Compete with other listeners, ranked by total listening time
- **ENS Integration**: Display ENS names on leaderboard
- **Collection Management**: View your owned mixtapes
- **Download Support**: Download your purchased mixtapes (coming soon)

## Tech Stack

### Frontend
- **Next.js 16** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS v4** - Utility-first styling
- **Wagmi v2** - React hooks for Ethereum
- **RainbowKit** - Wallet connection UI
- **Viem** - TypeScript Ethereum library
- **TanStack Query** - Data fetching and caching

### Backend
- **Supabase** - PostgreSQL database, storage, and edge functions
- **Base Chain** - L2 blockchain for low-cost transactions

### Smart Contracts
- **Solidity 0.8.20** - Smart contract language
- **Foundry** - Development framework
- **OpenZeppelin** - Secure contract libraries

## Project Structure

```
mixtape/
├── app/                          # Next.js app directory
│   ├── layout.tsx               # Root layout with providers
│   ├── page.tsx                 # Landing page
│   ├── player/page.tsx          # Music player
│   ├── collection/page.tsx      # User's collection
│   └── leaderboard/page.tsx     # Listening leaderboard
├── components/                   # React components
│   ├── PurchaseCard.tsx         # USDC payment UI
│   ├── MixtapePlayer.tsx        # Audio player
│   ├── CollectionGrid.tsx       # Display owned NFTs
│   └── LeaderboardTable.tsx     # Rankings
├── hooks/                        # Custom React hooks
│   ├── useUsdcTransfer.ts       # USDC payments
│   ├── useMixtapePurchase.ts    # Purchase orchestration
│   ├── useMixtapeOwnership.ts   # NFT balance checking
│   ├── useAudioPlayer.ts        # Audio controls
│   ├── useListeningTracker.ts   # Time tracking
│   └── useEnsResolution.ts      # ENS name lookup
├── lib/                          # Shared utilities
│   ├── constants.ts             # Contract addresses, ABIs
│   ├── wagmi-config.ts          # Wagmi configuration
│   └── supabase.ts              # Supabase client
├── providers/                    # React context providers
│   └── Providers.tsx            # Wagmi + RainbowKit wrapper
├── contracts/                    # Smart contracts
│   ├── PizzaMixtapeNFT.sol      # ERC-1155 NFT contract
│   ├── foundry.toml             # Foundry config
│   └── script/Deploy.s.sol      # Deployment script
└── supabase/                     # Supabase configuration
    ├── migrations/              # Database schema
    └── functions/               # Edge functions
        ├── mint-mixtape/        # Mint NFT after payment
        └── verify-ownership/    # Generate signed URLs

```

## Getting Started

### Prerequisites

- [Node.js 18+](https://nodejs.org/)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)
- [Foundry](https://book.getfoundry.sh/) (for smart contracts)
- [Supabase CLI](https://supabase.com/docs/guides/cli) (for backend)
- Wallet with Base ETH and USDC for testing

### Installation

1. **Clone the repository**

```bash
cd mixtape
```

2. **Install dependencies**

```bash
npm install
```

3. **Set up environment variables**

Copy `.env.example` to `.env` and fill in the values:

```bash
cp .env.example .env
```

Required variables:
- `NEXT_PUBLIC_USDC_ADDRESS` - USDC contract on Base (already set)
- `NEXT_PUBLIC_NFT_CONTRACT_ADDRESS` - Your deployed NFT contract
- `NEXT_PUBLIC_TREASURY_ADDRESS` - Wallet to receive payments
- `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` - From [WalletConnect Cloud](https://cloud.walletconnect.com/)
- `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Your Supabase anonymous key

4. **Run the development server**

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

## Deployment

### 1. Deploy Smart Contract

```bash
cd contracts

# Install dependencies
forge install

# Deploy to Base Sepolia (testnet)
forge script script/Deploy.s.sol:DeployScript \
  --rpc-url https://sepolia.base.org \
  --broadcast \
  --verify

# Deploy to Base Mainnet
forge script script/Deploy.s.sol:DeployScript \
  --rpc-url $BASE_RPC_URL \
  --broadcast \
  --verify
```

See [contracts/README.md](./contracts/README.md) for details.

### 2. Set Up Supabase

```bash
# Link project
supabase link --project-ref your-project-ref

# Run migrations
supabase db push

# Create storage buckets
supabase storage create mixtape-audio --public false
supabase storage create mixtape-covers --public true

# Deploy edge functions
supabase functions deploy

# Set secrets
supabase secrets set MINTER_PRIVATE_KEY=0x...
supabase secrets set NFT_CONTRACT_ADDRESS=0x...
supabase secrets set TREASURY_ADDRESS=0x...
```

See [supabase/README.md](./supabase/README.md) for details.

### 3. Deploy Frontend

Deploy to [Vercel](https://vercel.com):

```bash
npm install -g vercel
vercel
```

Or use the Vercel dashboard to import the GitHub repository.

**Important**: Add all environment variables in Vercel project settings.

## Usage

### Purchasing a Mixtape

1. Connect your wallet using RainbowKit
2. Ensure you have Base ETH (for gas) and USDC (for payment)
3. Click "Buy Now" for $4.20 USDC
4. Approve the USDC transfer in your wallet
5. Wait for the transaction to confirm
6. Your NFT will be minted automatically
7. Access the player and start listening

### Listening and Tracking Time

1. Navigate to the Player page
2. The app verifies your NFT ownership
3. Audio loads with signed URL from Supabase
4. Listening time is tracked every 30 seconds
5. Time is aggregated on your user profile
6. View your rank on the Leaderboard

### Leaderboard

- Ranked by total listening time (all sessions combined)
- Updates every 30 seconds
- Displays ENS names if available
- Shows shortened addresses otherwise (0x1234...5678)

## Architecture

### Purchase Flow

```
User → USDC Transfer → Treasury Wallet
                    ↓
        Backend Verifies Transaction
                    ↓
        Backend Mints NFT to User
                    ↓
            User Owns Mixtape
```

### Streaming Flow

```
User Requests Audio → Backend Checks NFT Balance
                    ↓
            Balance > 0?
                    ↓
        Generate Signed URL (1hr expiry)
                    ↓
        User Streams Audio
                    ↓
    Track Time Every 30s → Update Database
```

### Listening Time Tracking

```
User Plays Audio → Start Session in DB
                    ↓
        Track Time Every 30s
                    ↓
    Update Session + User Total Time
                    ↓
        Display on Leaderboard
```

## Security Considerations

- **Private Keys**: Never commit private keys. Use environment variables and Supabase secrets.
- **USDC Verification**: Backend verifies actual blockchain transactions before minting.
- **NFT Ownership**: Player checks NFT balance on-chain before streaming.
- **Signed URLs**: Audio URLs expire after 1 hour.
- **Rate Limiting**: Consider adding rate limits to prevent abuse.
- **RLS Policies**: Supabase Row Level Security protects user data.

## Testing

### Frontend Testing

```bash
npm run build
```

Check for TypeScript errors and build issues.

### Smart Contract Testing

```bash
cd contracts
forge test
```

### Manual E2E Testing

1. Connect wallet on Base Sepolia testnet
2. Get test USDC from faucet
3. Purchase mixtape
4. Verify NFT in collection
5. Play mixtape
6. Check listening time updates
7. View leaderboard

## Troubleshooting

### "Transaction failed" during purchase
- Ensure you have enough Base ETH for gas
- Check USDC balance is at least $4.20
- Verify treasury address is correct

### Audio won't load
- Check NFT ownership on BaseScan
- Verify Supabase edge function is deployed
- Check browser console for errors
- Ensure audio file is uploaded to Supabase Storage

### Listening time not tracking
- Check browser console for errors
- Verify Supabase edge function is deployed
- Ensure you're connected to the correct wallet
- Check that audio is actually playing

## Contributing

Contributions are welcome! Please follow these guidelines:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

MIT License - see LICENSE file for details

## Acknowledgments

- **PizzaDAO** - Community and inspiration
- **Base** - L2 blockchain infrastructure
- **Supabase** - Backend services
- **RainbowKit** - Wallet connection UI
- **Wagmi** - React hooks for Ethereum

## Support

For issues, questions, or feedback:
- Open a GitHub issue
- Contact PizzaDAO community

---

Built with 🍕 by PizzaDAO
