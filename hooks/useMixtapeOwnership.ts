import { useReadContract } from 'wagmi';
import { NFT_CONTRACT_ADDRESS, MIXTAPE_NFT_ABI, MIXTAPE_TOKEN_ID } from '@/lib/constants';

export function useMixtapeOwnership(address: string | undefined) {
  const { data: balance, isLoading, error, refetch } = useReadContract({
    address: NFT_CONTRACT_ADDRESS,
    abi: MIXTAPE_NFT_ABI,
    functionName: 'balanceOf',
    args: address ? [address as `0x${string}`, BigInt(MIXTAPE_TOKEN_ID)] : undefined,
    query: {
      enabled: !!address && !!NFT_CONTRACT_ADDRESS,
    },
  });

  const ownsNFT = balance !== undefined && balance > 0n;
  const quantity = balance ? Number(balance) : 0;

  return {
    ownsNFT,
    balance,
    quantity,
    isLoading,
    error,
    refetch,
  };
}
