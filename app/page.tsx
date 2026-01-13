'use client';

import { useState } from 'react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount } from 'wagmi';
import { getImagePath } from '@/lib/utils';

export default function Home() {
  const [selectedVolume, setSelectedVolume] = useState<1 | 2>(1);
  const { isConnected } = useAccount();

  const volumes = {
    1: {
      image: getImagePath('/mixtape-vol-1.jpg'),
      title: 'Volume 1',
      tracks: [
        'Sauce',
        'Rare Pizzas',
        'Pizza Mind',
        'DAO It',
        'I Ate Myself and Want To Pie',
        'Pizza Shortie',
        'Pizza Pop',
        'Wow! That\'s Rare Pizzas',
        'Pizza Tron',
        'PizzaDAO (We in the Metaverse)',
        'Ain\'t No Za (if The Homies Can\'t Have a Slice)',
        'Slice of Heaven',
        'Molto Bene',
        'Rare Pizzas Mixtape Outro'
      ]
    },
    2: {
      image: getImagePath('/mixtape-vol-2.png'),
      title: 'Volume 2',
      tracks: [
        'Opening - Back in the Kitchen',
        'New York Style',
        'Chicago Deep',
        'Detroit Square',
        'California Dreams',
        'Neapolitan Nights',
        'Sicilian Soul',
        'White Pizza (Interlude)',
        'Extra Cheese',
        'Hot Out The Oven',
        'The Crust',
        'Closing - Until Next Time'
      ]
    }
  };

  const currentVolume = volumes[selectedVolume];

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
          {/* PizzaDAO Logo centered above title */}
          <img
            src={getImagePath('/pizzadao-logo-white.png')}
            alt="PizzaDAO"
            className="h-12 w-auto mx-auto mb-4"
          />

          <h2 className="text-6xl md:text-7xl font-black mb-4 text-yellow-400 tracking-tight">
            THE RARE PIZZAS MIXTAPE
          </h2>
          <p className="text-2xl mb-8 text-gray-300"> <span className="text-white-400 font-bold">HOT & FRESH</span></p>

          {/* Volume Selector */}
          <div className="flex gap-4 justify-center mb-8">
            <button
              onClick={() => setSelectedVolume(1)}
              className={`px-6 py-3 font-bold text-lg border-2 transition ${
                selectedVolume === 1
                  ? 'bg-yellow-400 text-black border-yellow-400'
                  : 'bg-transparent text-gray-400 border-gray-600 hover:border-yellow-400 hover:text-yellow-400'
              }`}
            >
              Volume 1
            </button>
            <button
              onClick={() => setSelectedVolume(2)}
              className={`px-6 py-3 font-bold text-lg border-2 transition ${
                selectedVolume === 2
                  ? 'bg-yellow-400 text-black border-yellow-400'
                  : 'bg-transparent text-gray-400 border-gray-600 hover:border-yellow-400 hover:text-yellow-400'
              }`}
            >
              Volume 2
            </button>
          </div>
        </div>

        <div className="max-w-6xl mx-auto mb-12">
          <div className="grid md:grid-cols-2 gap-8 items-start">
            {/* Album Cover */}
            <div className="bg-gray-900 rounded-lg p-6 border-2 border-yellow-500">
              <div className="aspect-square rounded-lg overflow-hidden border-2 border-yellow-400">
                <img
                  src={currentVolume.image}
                  alt={`The Rare Pizzas Mixtape ${currentVolume.title}`}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            {/* Tracklist and Collect Button */}
            <div className="bg-gray-900 rounded-lg p-6 border-2 border-yellow-500">
              <h3 className="text-2xl font-bold text-yellow-400 mb-6">Tracklist - {currentVolume.title}</h3>

              {/* Two-column tracklist for larger screens */}
              <ol className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 text-gray-300">
                {currentVolume.tracks.map((track, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <span className="text-yellow-400 font-mono text-sm mt-0.5 flex-shrink-0">{String(index + 1).padStart(2, '0')}</span>
                    <span className="text-sm">{track}</span>
                  </li>
                ))}
              </ol>

              {/* Collect Button */}
              <div className="pt-4 border-t border-gray-700">
                {isConnected ? (
                  <button className="w-full bg-yellow-400 hover:bg-yellow-500 text-black font-black py-4 px-6 text-xl transition transform hover:scale-105 border-2 border-yellow-400">
                    Collect
                  </button>
                ) : (
                  <div className="w-full">
                    <p className="text-gray-400 text-sm mb-3 text-center">Connect wallet to collect</p>
                    <ConnectButton />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="text-center">
          <h3 className="text-3xl font-bold mb-8 text-yellow-400">Explore</h3>
          <div className="flex gap-4 justify-center flex-wrap">
            <a href="/collection" className="bg-yellow-400 hover:bg-yellow-500 px-8 py-4 transition transform hover:scale-105 font-bold text-xl text-black border-2 border-yellow-400">
              View Collection
            </a>
            <a href="/leaderboard" className="bg-purple-600 hover:bg-purple-700 px-8 py-4 transition transform hover:scale-105 font-bold text-xl border-2 border-purple-400">
              Leaderboard
            </a>
            <a href="/player" className="bg-gray-900 hover:bg-gray-800 px-8 py-4 transition transform hover:scale-105 font-bold text-xl border-2 border-yellow-400">
              Player
            </a>
          </div>
        </div>
      </main>
    </div>
  );
}
