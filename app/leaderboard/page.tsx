'use client';

import { ConnectButton } from '@rainbow-me/rainbowkit';
import { LeaderboardTable } from '@/components/LeaderboardTable';

export default function LeaderboardPage() {
  return (
    <div className="min-h-screen bg-black text-white">
      <nav className="container mx-auto px-4 py-6 flex justify-between items-center">
        <a href="/" className="text-2xl font-bold text-pizza-yellow">PizzaDAO Mixtape</a>
        <div className="flex gap-4 items-center">
          <a href="/player" className="text-gray-300 hover:text-pizza-yellow transition">
            Player
          </a>
          <a href="/collection" className="text-gray-300 hover:text-pizza-yellow transition">
            Collection
          </a>
          <a href="/artists" className="text-gray-300 hover:text-white transition">
            Artists
          </a>
          <ConnectButton />
        </div>
      </nav>

      <main className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4 text-pizza-yellow">Leaderboard</h1>
          <p className="text-xl text-gray-400">
            Top listeners ranked by total listening time
          </p>
        </div>

        <div className="max-w-4xl mx-auto mb-8">
          <div className="bg-pizza-red/20 border border-pizza-red rounded-lg p-6 mb-8">
            <h2 className="text-xl font-bold mb-2 text-pizza-yellow">How It Works</h2>
            <ul className="text-gray-300 space-y-2">
              <li>- Listen to the mixtape to earn listening time</li>
              <li>- Time is tracked every 30 seconds while playing</li>
              <li>- Compete with other listeners for the top spot</li>
              <li>- Your ENS name will be displayed if you have one</li>
            </ul>
          </div>

          <LeaderboardTable />
        </div>

        <div className="text-center mt-12">
          <p className="text-gray-400 mb-4">Want to climb the leaderboard?</p>
          <div className="flex gap-4 justify-center">
            <a
              href="/player"
              className="bg-pizza-red hover:brightness-110 text-white font-bold py-3 px-8 rounded-lg transition"
            >
              Start Listening
            </a>
            <a
              href="/"
              className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-3 px-8 rounded-lg transition"
            >
              Buy Mixtape
            </a>
          </div>
        </div>
      </main>
    </div>
  );
}
