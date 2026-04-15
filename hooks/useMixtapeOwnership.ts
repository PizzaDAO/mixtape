import { useReadContract } from 'wagmi';
import { NFT_CONTRACT_ADDRESS, MIXTAPE_NFT_ABI, MIXTAPE_TOKEN_ID } from '@/lib/constants';

const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';

/**
 * Returns true if the NFT contract address is properly configured
 * (non-empty and not the zero address).
 */
function isValidContractAddress(address: string): boolean {
  return !!address && address !== ZERO_ADDRESS;
}

export function useMixtapeOwnership(address: string | undefined) {
  const contractConfigured = isValidContractAddress(NFT_CONTRACT_ADDRESS);

  const { data: balance, isLoading, error, refetch } = useReadContract({
    address: NFT_CONTRACT_ADDRESS,
    abi: MIXTAPE_NFT_ABI,
    functionName: 'balanceOf',
    args: address ? [address as `0x${string}`, BigInt(MIXTAPE_TOKEN_ID)] : undefined,
    query: {
      enabled: !!address && contractConfigured,
    },
  });

  const ownsNFT = balance !== undefined && balance > BigInt(0);
  const quantity = balance ? Number(balance) : 0;

  return {
    ownsNFT,
    balance,
    quantity,
    isLoading,
    error,
    refetch,
    /** True when NFT_CONTRACT_ADDRESS is missing or the zero address */
    isContractMisconfigured: !contractConfigured,
  };
}
