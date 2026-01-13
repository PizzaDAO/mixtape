'use client';

import { useAccount } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { CollectionGrid } from '@/components/CollectionGrid';
import { useMixtapeOwnership } from '@/hooks/useMixtapeOwnership';

export default function CollectionPage() {
  const { address, isConnected } = useAccount();
  const { ownsNFT, quantity, isLoading } = useMixtapeOwnership(address);

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-purple-900 to-black text-white">
        <nav className="container mx-auto px-4 py-6 flex justify-between items-center">
          <a href="/" className="text-2xl font-bold">PizzaDAO Mixtape</a>
          <ConnectButton />
        </nav>

        <main className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-4xl font-bold mb-6">My Collection</h1>
          <p className="text-xl text-gray-400 mb-8">
            Connect your wallet to view your mixtape collection
          </p>
          <ConnectButton />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-900 to-black text-white">
      <nav className="container mx-auto px-4 py-6 flex justify-between items-center">
        <a href="/" className="text-2xl font-bold">PizzaDAO Mixtape</a>
        <div className="flex gap-4 items-center">
          <a href="/player" className="text-gray-300 hover:text-white transition">
            Player
          </a>
          <a href="/leaderboard" className="text-gray-300 hover:text-white transition">
            Leaderboard
          </a>
          <ConnectButton />
        </div>
      </nav>

      <main className="container mx-auto px-4 py-16">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">My Collection</h1>
          <p className="text-gray-400">
            {address && `Connected: ${address.slice(0, 6)}...${address.slice(-4)}`}
          </p>
        </div>

        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-orange-500 mx-auto mb-4"></div>
            <p className="text-xl text-gray-400">Loading collection...</p>
          </div>
        ) : !ownsNFT ? (
          <div className="bg-black/50 rounded-lg p-12 text-center max-w-2xl mx-auto">
            <div className="text-6xl mb-6">📂</div>
            <h2 className="text-3xl font-bold mb-4">No Mixtapes Yet</h2>
            <p className="text-gray-400 mb-8">
              You don't own any PizzaDAO Mixtape NFTs yet. Purchase one to start your collection!
            </p>
            <a
              href="/"
              className="inline-block bg-orange-600 hover:bg-orange-700 text-white font-bold py-3 px-8 rounded-lg transition"
            >
              Buy Mixtape
            </a>
          </div>
        ) : (
          <>
            <div className="mb-6">
              <div className="flex items-center gap-4">
                <h2 className="text-2xl font-bold">Owned Mixtapes</h2>
                <span className="bg-orange-600 text-white px-4 py-1 rounded-full font-bold">
                  {quantity} {quantity === 1 ? 'copy' : 'copies'}
                </span>
              </div>
            </div>

            <CollectionGrid quantity={quantity} />
          </>
        )}
      </main>
    </div>
  );
}
