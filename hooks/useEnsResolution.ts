import { useState, useEffect } from 'react';
import { usePublicClient } from 'wagmi';
import { mainnet } from 'wagmi/chains';
import { normalize } from 'viem/ens';

export function useEnsResolution(addressOrEns: string | undefined) {
  const publicClient = usePublicClient({ chainId: mainnet.id });
  const [ensName, setEnsName] = useState<string | null>(null);
  const [resolvedAddress, setResolvedAddress] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!addressOrEns || !publicClient) return;

    const resolve = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // Check if input is an ENS name (contains .eth)
        if (addressOrEns.includes('.eth')) {
          // Resolve ENS to address
          const address = await publicClient.getEnsAddress({
            name: normalize(addressOrEns),
          });
          setResolvedAddress(address);
          setEnsName(addressOrEns);
        } else if (addressOrEns.startsWith('0x')) {
          // Input is an address, try to get ENS name
          const name = await publicClient.getEnsName({
            address: addressOrEns as `0x${string}`,
          });
          setEnsName(name);
          setResolvedAddress(addressOrEns);
        }
      } catch (err) {
        console.error('ENS resolution error:', err);
        setError('Failed to resolve ENS name');
        // If resolution fails, just use the address
        if (addressOrEns.startsWith('0x')) {
          setResolvedAddress(addressOrEns);
        }
      } finally {
        setIsLoading(false);
      }
    };

    resolve();
  }, [addressOrEns, publicClient]);

  return {
    ensName,
    resolvedAddress,
    isLoading,
    error,
  };
}
