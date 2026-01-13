import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { USDC_ADDRESS, USDC_DECIMALS, ERC20_ABI } from '@/lib/constants';

export function useUsdcTransfer() {
  const { writeContract, data: hash, error, isPending } = useWriteContract();

  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  });

  const transfer = async (to: string, amount: number) => {
    // Convert amount to smallest unit (USDC has 6 decimals)
    const amountInSmallestUnit = BigInt(Math.floor(amount * 10 ** USDC_DECIMALS));

    await writeContract({
      address: USDC_ADDRESS,
      abi: ERC20_ABI,
      functionName: 'transfer',
      args: [to as `0x${string}`, amountInSmallestUnit],
    });
  };

  return {
    transfer,
    hash,
    error,
    isPending,
    isConfirming,
    isConfirmed,
  };
}
