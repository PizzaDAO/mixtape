import { useAccount, useReadContract } from 'wagmi';
import { USDC_ADDRESS, USDC_DECIMALS, ERC20_ABI, MIXTAPE_PRICE } from '@/lib/constants';

export function useUsdcBalance() {
  const { address } = useAccount();

  const { data: rawBalance, isLoading, refetch } = useReadContract({
    address: USDC_ADDRESS,
    abi: ERC20_ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
    },
  });

  const balance = rawBalance !== undefined
    ? Number(rawBalance) / 10 ** USDC_DECIMALS
    : 0;

  const hasEnough = balance >= MIXTAPE_PRICE;

  return {
    balance,
    hasEnough,
    isLoading,
    refetch,
  };
}
