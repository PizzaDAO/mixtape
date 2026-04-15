import { Artist } from '@/lib/artists';
import { getImagePath } from '@/lib/utils';

interface ArtistCardProps {
  artist: Artist;
}

export function ArtistCard({ artist }: ArtistCardProps) {
  const trackCount = artist.tracks.length;

  return (
    <a
      href={getImagePath(`/artists/${artist.slug}`)}
      className="block bg-gray-900 border-2 border-yellow-500 overflow-hidden hover:scale-105 transition-transform"
    >
      <div className="aspect-square overflow-hidden">
        <img
          src={getImagePath(artist.photoUrl)}
          alt={artist.name}
          className="w-full h-full object-cover"
        />
      </div>
      <div className="p-4">
        <h3 className="text-white font-bold text-lg">{artist.name}</h3>
        <p className="text-gray-400 text-sm">
          {trackCount} {trackCount === 1 ? 'track' : 'tracks'}
        </p>
      </div>
    </a>
  );
}
