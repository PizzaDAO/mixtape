'use client';

import { useState } from 'react';
import { useConnectModal } from '@rainbow-me/rainbowkit';
import { useAccount } from 'wagmi';
import { getImagePath } from '@/lib/utils';
import { VOLUMES, getTrackTitles, type VolumeNumber } from '@/lib/tracks';
import { PurchaseModal } from '@/components/PurchaseModal';
import { useMixtapeOwnership } from '@/hooks/useMixtapeOwnership';

export default function Home() {
  const [selectedVolume, setSelectedVolume] = useState<VolumeNumber>(1);
  const [isPurchaseOpen, setIsPurchaseOpen] = useState(false);
  const { isConnected, address } = useAccount();
  const { openConnectModal } = useConnectModal();
  const { ownsNFT } = useMixtapeOwnership(address);

  const currentVolume = VOLUMES[selectedVolume];
  const trackTitles = getTrackTitles(selectedVolume);

  return (
    <div className="min-h-screen bg-black text-white relative">
      {/* GitHub + Google Sheets links — bottom right */}
      <div className="fixed bottom-4 right-4 flex items-center gap-3 z-50">
        {/* Google Sheets (left) */}
        <a
          href="https://docs.google.com/spreadsheets/d/1o0LZFnQkuT5GGhqbAWSTi5ozfG1QctUqQD0PQwVBm8g/edit?gid=0#gid=0"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:scale-110 transition-transform"
        >
          <img
            src="https://cdn.simpleicons.org/googlesheets/ffffff"
            alt="Google Sheets"
            className="w-8 h-8"
          />
        </a>

        {/* GitHub (right) */}
        <a
          href="https://github.com/PizzaDAO/mixtape"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:scale-110 transition-transform"
        >
          <img
            src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/github/github-original.svg"
            alt="GitHub"
            className="w-8 h-8 filter invert"
          />
        </a>
      </div>

      <main className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          {/* PizzaDAO Records Logo centered above title */}
          <div className="flex items-center justify-center gap-4 mb-2">
            <img
              src={getImagePath('/pizzadao-records.png')}
              alt="PizzaDAO Records"
              className="h-24 w-auto invert"
            />
            <span className="text-4xl md:text-5xl text-white font-[family-name:var(--font-naiche)]">
              PizzaDAO Records
            </span>
          </div>
          <p className="text-xl mb-6 text-gray-300 font-[family-name:var(--font-naiche)]">presents</p>

          <div className="relative inline-block mb-4">
            <h2 className="text-6xl md:text-7xl font-black text-pizza-yellow tracking-tight">
              RARE PIZZAS MIXTAPE
            </h2>
            <span className="absolute -top-3 -right-4 bg-pizza-red text-white font-black text-xs tracking-widest uppercase px-3 py-1 rounded-full rotate-12">HOT & FRESH</span>
          </div>
          <p className="text-lg text-gray-400 mb-8">Executive Produced by <a href="https://linktr.ee/lobo_301" target="_blank" rel="noopener noreferrer" className="text-pizza-yellow hover:underline">LoBo_301</a></p>

          {/* Volume Selector */}
          <div className="flex gap-4 justify-center mb-8">
            <button
              onClick={() => setSelectedVolume(1)}
              className={`px-6 py-3 font-bold text-lg border-2 transition ${
                selectedVolume === 1
                  ? 'bg-pizza-yellow text-black border-pizza-yellow'
                  : 'bg-transparent text-gray-400 border-gray-600 hover:border-pizza-yellow hover:text-pizza-yellow'
              }`}
            >
              Volume 1
            </button>
            <button
              onClick={() => setSelectedVolume(2)}
              className={`px-6 py-3 font-bold text-lg border-2 transition ${
                selectedVolume === 2
                  ? 'bg-pizza-yellow text-black border-pizza-yellow'
                  : 'bg-transparent text-gray-400 border-gray-600 hover:border-pizza-yellow hover:text-pizza-yellow'
              }`}
            >
              Volume 2
            </button>
          </div>
        </div>

        <div className="max-w-6xl mx-auto mb-12">
          <div className="grid md:grid-cols-2 gap-8 items-start">
            {/* Album Cover */}
            <div className="bg-gray-900 rounded-lg p-6 border-2 border-pizza-yellow">
              <div className="aspect-square rounded-lg overflow-hidden border-2 border-pizza-yellow">
                <img
                  src={currentVolume.image}
                  alt={`The Rare Pizzas Mixtape ${currentVolume.title}`}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            {/* Tracklist and Collect Button */}
            <div className="bg-gray-900 rounded-lg p-6 border-2 border-pizza-yellow">
              <h3 className="text-2xl font-bold text-pizza-yellow mb-6">Tracklist</h3>

              {/* Two-column tracklist for larger screens */}
              <ol className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 text-gray-300">
                {trackTitles.map((track, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <span className="text-pizza-yellow font-mono text-sm mt-0.5 flex-shrink-0">{String(index + 1).padStart(2, '0')}</span>
                    <span className="text-sm">{track}</span>
                  </li>
                ))}
              </ol>

              {/* Collect/Buy Button */}
              <div className="pt-4 border-t border-gray-700">
                {isConnected ? (
                  ownsNFT ? (
                    <div className="flex gap-4">
                      <button
                        onClick={() => setIsPurchaseOpen(true)}
                        className="flex-1 bg-pizza-yellow hover:brightness-110 text-black font-black py-4 px-6 text-xl transition transform hover:scale-105 border-2 border-pizza-yellow"
                      >
                        Collected — Buy Another
                      </button>
                      <a
                        href="/player"
                        className="flex-1 bg-pizza-red hover:brightness-110 text-white font-black py-4 px-6 text-xl text-center transition transform hover:scale-105 border-2 border-pizza-red"
                      >
                        Play Now
                      </a>
                    </div>
                  ) : (
                    <button
                      onClick={() => setIsPurchaseOpen(true)}
                      className="w-full bg-pizza-yellow hover:brightness-110 text-black font-black py-4 px-6 text-xl transition transform hover:scale-105 border-2 border-pizza-yellow"
                    >
                      Collect — $4.20 USDC
                    </button>
                  )
                ) : (
                  <button
                    onClick={openConnectModal}
                    className="w-full bg-pizza-yellow hover:brightness-110 text-black font-black py-4 px-6 text-xl transition transform hover:scale-105 border-2 border-pizza-yellow"
                  >
                    Buy
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="text-center">
          <h3 className="text-3xl font-bold mb-8 text-pizza-yellow">Explore</h3>
          <div className="flex gap-4 justify-center flex-wrap">
            <a href={getImagePath('/collection')} className="bg-pizza-yellow hover:brightness-110 px-8 py-4 transition transform hover:scale-105 font-bold text-xl text-black border-2 border-pizza-yellow">
              View Collection
            </a>
            <a href={getImagePath('/leaderboard')} className="bg-pizza-red hover:brightness-110 px-8 py-4 transition transform hover:scale-105 font-bold text-xl text-white border-2 border-pizza-red">
              Leaderboard
            </a>
            <a href={getImagePath('/player')} className="bg-gray-900 hover:bg-gray-800 px-8 py-4 transition transform hover:scale-105 font-bold text-xl border-2 border-pizza-yellow">
              Player
            </a>
            <a href={getImagePath('/artists')} className="px-8 py-4 transition transform hover:scale-105 font-bold text-xl border-2" style={{ backgroundColor: '#7DD3E8', borderColor: '#7DD3E8', color: 'black' }}>
              Artists
            </a>
          </div>
        </div>
      </main>

      <PurchaseModal
        isOpen={isPurchaseOpen}
        onClose={() => setIsPurchaseOpen(false)}
      />
    </div>
  );
}
