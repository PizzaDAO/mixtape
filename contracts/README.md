# PizzaDAO Mixtape NFT Smart Contract

ERC-1155 smart contract for the PizzaDAO Mixtape NFT.

## Prerequisites

- [Foundry](https://book.getfoundry.sh/getting-started/installation) installed
- Private keys for deployer and minter wallets
- Base ETH for gas fees
- BaseScan API key for contract verification

## Setup

1. Install OpenZeppelin contracts:

```bash
cd contracts
forge install OpenZeppelin/openzeppelin-contracts
```

2. Create a `.env` file in the `contracts` directory:

```bash
DEPLOYER_PRIVATE_KEY=0xyour_deployer_private_key
MINTER_WALLET_ADDRESS=0xyour_backend_wallet_address
BASESCAN_API_KEY=your_basescan_api_key
BASE_RPC_URL=https://mainnet.base.org
```

## Compilation

```bash
forge build
```

## Testing

```bash
forge test
```

## Deployment

### Deploy to Base Sepolia (testnet)

```bash
forge script script/Deploy.s.sol:DeployScript \
  --rpc-url https://sepolia.base.org \
  --broadcast \
  --verify
```

### Deploy to Base Mainnet

```bash
forge script script/Deploy.s.sol:DeployScript \
  --rpc-url $BASE_RPC_URL \
  --broadcast \
  --verify
```

## After Deployment

1. Copy the deployed contract address
2. Add the address to your `.env` file as `NEXT_PUBLIC_NFT_CONTRACT_ADDRESS`
3. Update the frontend constants in `lib/constants.ts`
4. Add the contract address and ABI to Supabase edge functions

## Contract Functions

### Owner Functions
- `setAuthorizedMinter(address minter, bool authorized)` - Authorize or revoke minter
- `setURI(string memory newuri)` - Update metadata URI

### Minter Functions
- `mint(address to, uint256 amount)` - Mint NFTs to an address

### View Functions
- `balanceOf(address account)` - Get balance of mixtapes owned
- `uri(uint256 tokenId)` - Get token metadata URI
- `totalMinted()` - Get total supply of minted NFTs
- `authorizedMinters(address)` - Check if address is authorized minter

## Security Considerations

- Only authorized minters can mint NFTs
- Minter authorization is controlled by contract owner
- Backend wallet should be the only authorized minter
- Store private keys securely (never commit to git)
