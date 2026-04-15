import { ARTISTS, getArtistBySlug } from '@/lib/artists';
import { ArtistSocials } from '@/components/ArtistSocials';
import { getImagePath } from '@/lib/utils';
import { notFound } from 'next/navigation';

export function generateStaticParams() {
  return ARTISTS.map((a) => ({ slug: a.slug }));
}

interface ArtistPageProps {
  params: Promise<{ slug: string }>;
}

export default async function ArtistPage({ params }: ArtistPageProps) {
  const { slug } = await params;
  const artist = getArtistBySlug(slug);

  if (!artist) {
    notFound();
  }

  // Group tracks by volume
  const vol1Tracks = artist.tracks
    .filter((t) => t.volume === 1)
    .sort((a, b) => a.trackNumber - b.trackNumber);
  const vol2Tracks = artist.tracks
    .filter((t) => t.volume === 2)
    .sort((a, b) => a.trackNumber - b.trackNumber);

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
            href={getImagePath('/artists')}
            className="text-gray-300 hover:text-white transition"
          >
            Artists
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
        {/* Back link */}
        <a
          href={getImagePath('/artists')}
          className="inline-flex items-center gap-2 text-yellow-400 hover:text-yellow-300 transition mb-8"
        >
          <svg
            viewBox="0 0 20 20"
            fill="currentColor"
            className="w-5 h-5"
          >
            <path
              fillRule="evenodd"
              d="M17 10a.75.75 0 01-.75.75H5.612l4.158 3.96a.75.75 0 11-1.04 1.08l-5.5-5.25a.75.75 0 010-1.08l5.5-5.25a.75.75 0 111.04 1.08L5.612 9.25H16.25A.75.75 0 0117 10z"
              clipRule="evenodd"
            />
          </svg>
          Back to All Artists
        </a>

        {/* Artist header: two-column on desktop, stacked on mobile */}
        <div className="max-w-5xl mx-auto mb-12">
          <div className="grid md:grid-cols-2 gap-8 items-start">
            {/* Photo */}
            <div className="bg-gray-900 border-2 border-yellow-500 overflow-hidden">
              <div className="aspect-square overflow-hidden">
                <img
                  src={getImagePath(artist.photoUrl)}
                  alt={artist.name}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            {/* Bio + Socials */}
            <div>
              <h1 className="text-4xl md:text-5xl font-bold text-yellow-400 mb-4">
                {artist.name}
              </h1>

              <div className="mb-6">
                <ArtistSocials socials={artist.socials} />
              </div>

              <p className="text-gray-300 text-lg leading-relaxed">
                {artist.bio}
              </p>
            </div>
          </div>
        </div>

        {/* Tracks section */}
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-yellow-400 mb-6">Tracks</h2>

          <div className="grid md:grid-cols-2 gap-8">
            {vol1Tracks.length > 0 && (
              <div className="bg-gray-900 border-2 border-yellow-500 p-6">
                <h3 className="text-xl font-bold text-white mb-4">Volume 1</h3>
                <ol className="space-y-3">
                  {vol1Tracks.map((track) => (
                    <li key={track.title} className="flex items-start gap-3">
                      <span className="text-yellow-400 font-mono text-sm mt-0.5 flex-shrink-0">
                        {String(track.trackNumber).padStart(2, '0')}
                      </span>
                      <span className="text-gray-300 text-sm">
                        {track.title}
                      </span>
                    </li>
                  ))}
                </ol>
              </div>
            )}

            {vol2Tracks.length > 0 && (
              <div className="bg-gray-900 border-2 border-yellow-500 p-6">
                <h3 className="text-xl font-bold text-white mb-4">Volume 2</h3>
                <ol className="space-y-3">
                  {vol2Tracks.map((track) => (
                    <li key={track.title} className="flex items-start gap-3">
                      <span className="text-yellow-400 font-mono text-sm mt-0.5 flex-shrink-0">
                        {String(track.trackNumber).padStart(2, '0')}
                      </span>
                      <span className="text-gray-300 text-sm">
                        {track.title}
                      </span>
                    </li>
                  ))}
                </ol>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
