import { ARTISTS } from '@/lib/artists';
import { ArtistCard } from '@/components/ArtistCard';
import { getImagePath } from '@/lib/utils';

export default function ArtistsPage() {
  return (
    <div className="min-h-screen bg-black text-white">
      <nav className="container mx-auto px-4 py-6 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <img
            src={getImagePath('/pizzadao-logo-white.png')}
            alt="PizzaDAO"
            className="h-10 w-auto"
          />
          <a href={getImagePath('/')} className="text-2xl font-bold">
            Mixtape
          </a>
        </div>
        <div className="flex gap-4 items-center">
          <a
            href={getImagePath('/')}
            className="text-gray-300 hover:text-white transition"
          >
            Home
          </a>
          <a
            href={getImagePath('/player')}
            className="text-gray-300 hover:text-white transition"
          >
            Player
          </a>
          <a
            href={getImagePath('/collection')}
            className="text-gray-300 hover:text-white transition"
          >
            Collection
          </a>
          <a
            href={getImagePath('/leaderboard')}
            className="text-gray-300 hover:text-white transition"
          >
            Leaderboard
          </a>
        </div>
      </nav>

      <main className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4 text-yellow-400">
            Meet the Artists
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            The talented producers and musicians behind the Rare Pizzas Mixtape.
            Get to know the people bringing the heat.
          </p>
        </div>

        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {ARTISTS.map((artist) => (
              <ArtistCard key={artist.slug} artist={artist} />
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
