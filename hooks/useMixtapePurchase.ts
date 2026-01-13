import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { useUsdcTransfer } from './useUsdcTransfer';
import { TREASURY_ADDRESS, MIXTAPE_PRICE } from '@/lib/constants';

type PurchaseStatus = 'idle' | 'transferring' | 'confirming' | 'minting' | 'success' | 'error';

export function useMixtapePurchase() {
  const { address } = useAccount();
  const { transfer, hash, isPending, isConfirming, isConfirmed, error: transferError } = useUsdcTransfer();

  const [status, setStatus] = useState<PurchaseStatus>('idle');
  const [mintTxHash, setMintTxHash] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const purchase = async () => {
    if (!address) {
      setErrorMessage('Please connect your wallet');
      setStatus('error');
      return;
    }

    if (!TREASURY_ADDRESS) {
      setErrorMessage('Treasury address not configured');
      setStatus('error');
      return;
    }

    try {
      // Step 1: Transfer USDC
      setStatus('transferring');
      setErrorMessage(null);
      await transfer(TREASURY_ADDRESS, MIXTAPE_PRICE);
    } catch (error: any) {
      console.error('Transfer error:', error);
      setErrorMessage(error.message || 'Failed to transfer USDC');
      setStatus('error');
    }
  };

  // Monitor transfer confirmation
  useEffect(() => {
    if (isPending) {
      setStatus('transferring');
    } else if (isConfirming) {
      setStatus('confirming');
    }
  }, [isPending, isConfirming]);

  // Call mint API after transfer is confirmed
  useEffect(() => {
    if (isConfirmed && hash && address) {
      const mintNFT = async () => {
        setStatus('minting');
        try {
          const response = await fetch(
            `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/mint-mixtape`,
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
              },
              body: JSON.stringify({
                userAddress: address,
                usdcTxHash: hash,
              }),
            }
          );

          const data = await response.json();

          if (response.ok && data.success) {
            setMintTxHash(data.mintTxHash);
            setStatus('success');
          } else {
            throw new Error(data.error || 'Failed to mint NFT');
          }
        } catch (error: any) {
          console.error('Mint error:', error);
          setErrorMessage(error.message || 'Failed to mint NFT');
          setStatus('error');
        }
      };

      mintNFT();
    }
  }, [isConfirmed, hash, address]);

  // Handle transfer errors
  useEffect(() => {
    if (transferError) {
      setErrorMessage(transferError.message || 'Transfer failed');
      setStatus('error');
    }
  }, [transferError]);

  const reset = () => {
    setStatus('idle');
    setMintTxHash(null);
    setErrorMessage(null);
  };

  return {
    purchase,
    status,
    usdcTxHash: hash,
    mintTxHash,
    errorMessage,
    reset,
    isProcessing: ['transferring', 'confirming', 'minting'].includes(status),
  };
}
