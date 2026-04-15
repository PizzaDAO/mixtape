'use client';

import { useAccount } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useMixtapePurchase } from '@/hooks/useMixtapePurchase';
import { useMixtapeOwnership } from '@/hooks/useMixtapeOwnership';
import { MIXTAPE_PRICE, getBaseScanLink } from '@/lib/constants';

export function PurchaseCard() {
  const { address, isConnected } = useAccount();
  const { ownsNFT, quantity, isLoading: isCheckingOwnership } = useMixtapeOwnership(address);
  const {
    purchase,
    status,
    usdcTxHash,
    mintTxHash,
    errorMessage,
    reset,
    isProcessing,
  } = useMixtapePurchase();

  if (!isConnected) {
    return (
      <div className="bg-gray-900 p-8 max-w-md mx-auto border-2 border-pizza-yellow">
        <h3 className="text-3xl font-bold mb-4 text-pizza-yellow">Connect Wallet to Purchase</h3>
        <p className="text-gray-300 mb-6 text-lg">
          Connect your wallet to buy The Rare Pizzas Mixtape NFT
        </p>
        <ConnectButton />
      </div>
    );
  }

  if (isCheckingOwnership) {
    return (
      <div className="bg-gray-900 p-8 max-w-md mx-auto border-2 border-pizza-yellow">
        <p className="text-gray-300 text-lg">Checking ownership...</p>
      </div>
    );
  }

  if (ownsNFT && status !== 'success') {
    return (
      <div className="bg-gray-900 border-2 border-pizza-yellow p-8 max-w-md mx-auto">
        <h3 className="text-3xl font-bold mb-4 text-pizza-yellow">You own {quantity} mixtape{quantity !== 1 ? 's' : ''}!</h3>
        <p className="text-gray-300 mb-6 text-lg">
          You can now listen to the mixtape and see your collection.
        </p>
        <div className="flex gap-4">
          <a
            href="/player"
            className="flex-1 bg-pizza-yellow hover:brightness-110 text-black font-bold py-3 px-6 text-center transition transform hover:scale-105 border-2 border-pizza-yellow"
          >
            Play Now
          </a>
          <a
            href="/collection"
            className="flex-1 bg-earth-blue hover:brightness-110 text-black font-bold py-3 px-6 text-center transition transform hover:scale-105 border-2 border-earth-blue"
          >
            View Collection
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-900 p-8 max-w-md mx-auto border-2 border-pizza-yellow">
      <h3 className="text-4xl font-bold mb-2 text-white">Buy Mixtape NFT</h3>
      <p className="text-5xl font-bold text-pizza-yellow mb-6">${MIXTAPE_PRICE} USDC</p>

      {status === 'idle' && (
        <>
          <p className="text-gray-300 mb-6 text-lg">
            Purchase The Rare Pizzas Mixtape NFT on Base chain. Stream, download,
            and compete on the leaderboard.
          </p>
          <button
            onClick={purchase}
            disabled={isProcessing}
            className="w-full bg-pizza-yellow hover:brightness-110 disabled:bg-gray-600 disabled:cursor-not-allowed text-black font-black py-4 px-6 text-2xl transition transform hover:scale-105 border-2 border-pizza-yellow"
          >
            Buy Now
          </button>
        </>
      )}

      {status === 'transferring' && (
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pizza-yellow mx-auto mb-4"></div>
          <p className="text-white font-semibold text-lg">Transferring USDC...</p>
          <p className="text-sm text-white/70 mt-2">Please confirm the transaction in your wallet</p>
        </div>
      )}

      {status === 'confirming' && (
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pizza-yellow mx-auto mb-4"></div>
          <p className="text-white font-semibold text-lg">Confirming transaction...</p>
          {usdcTxHash && (
            <a
              href={getBaseScanLink(usdcTxHash)}
              target="_blank"
              rel="noopener noreferrer"
              className="text-earth-blue hover:underline text-sm mt-2 block font-semibold"
            >
              View on BaseScan
            </a>
          )}
        </div>
      )}

      {status === 'minting' && (
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pizza-yellow mx-auto mb-4"></div>
          <p className="text-white font-semibold text-lg">Minting your NFT...</p>
          <p className="text-sm text-white/70 mt-2">This may take a few moments</p>
        </div>
      )}

      {status === 'success' && (
        <div className="text-center">
          <div className="text-pizza-yellow text-5xl mb-4">✓</div>
          <h4 className="text-3xl font-bold mb-4 text-pizza-yellow">Purchase Successful!</h4>
          <p className="text-gray-300 mb-4 text-lg">Your mixtape NFT has been minted</p>
          {mintTxHash && (
            <a
              href={getBaseScanLink(mintTxHash)}
              target="_blank"
              rel="noopener noreferrer"
              className="text-earth-blue hover:underline text-sm block mb-4 font-semibold"
            >
              View mint transaction
            </a>
          )}
          <div className="flex gap-4">
            <a
              href="/player"
              className="flex-1 bg-pizza-yellow hover:brightness-110 text-black font-bold py-3 px-6 text-center transition transform hover:scale-105 border-2 border-pizza-yellow"
            >
              Play Now
            </a>
            <button
              onClick={reset}
              className="flex-1 bg-pizza-red hover:brightness-110 text-white font-bold py-3 px-6 transition transform hover:scale-105 border-2 border-pizza-red"
            >
              Buy Another
            </button>
          </div>
        </div>
      )}

      {status === 'error' && (
        <div className="text-center">
          <div className="text-pizza-red text-5xl mb-4">✕</div>
          <h4 className="text-3xl font-bold mb-4 text-pizza-red">Error</h4>
          <p className="text-gray-300 mb-4 text-lg">{errorMessage || 'An error occurred'}</p>
          <button
            onClick={reset}
            className="w-full bg-pizza-yellow hover:brightness-110 text-black font-bold py-3 px-6 transition transform hover:scale-105 border-2 border-pizza-yellow"
          >
            Try Again
          </button>
        </div>
      )}
    </div>
  );
}
