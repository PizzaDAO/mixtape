import { ARTISTS } from '@/lib/artists';
import { getImagePath } from '@/lib/utils';

export default function ArtistsPage() {
  return (
    <div className="min-h-screen bg-black text-white">
      <nav className="container mx-auto px-4 py-6 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <img
            src={getImagePath('/pizzadao-records.png')}
            alt="PizzaDAO Records"
            className="h-12 w-auto invert"
          />
          <a href={getImagePath('/')} className="text-2xl font-bold font-[family-name:var(--font-naiche)]">
            PizzaDAO Records
          </a>
        </div>
        <div className="flex gap-4 items-center">
          <a href={getImagePath('/')} className="text-gray-300 hover:text-white transition">Home</a>
          <a href={getImagePath('/player')} className="text-gray-300 hover:text-white transition">Player</a>
        </div>
      </nav>

      <main className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4 text-pizza-yellow">
            Artists
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            The artists behind the Rare Pizzas Mixtape Vol. 1
          </p>
        </div>

        <div className="max-w-3xl mx-auto">
          <div className="space-y-4">
            {ARTISTS.map((artist) => (
              <div
                key={artist.slug}
                className="bg-gray-900 border border-gray-800 rounded-lg p-5 flex items-center justify-between"
              >
                <div>
                  <h3 className="text-lg font-bold text-white">{artist.name}</h3>
                  <div className="text-sm text-gray-400 mt-1">
                    {artist.tracks.map((t, i) => (
                      <span key={i}>
                        {i > 0 && <span className="mx-1">·</span>}
                        {t.title}
                      </span>
                    ))}
                  </div>
                </div>
                <span className="text-pizza-yellow font-mono text-sm flex-shrink-0 ml-4">
                  {artist.tracks.length} {artist.tracks.length === 1 ? 'track' : 'tracks'}
                </span>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
