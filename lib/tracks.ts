import { getImagePath } from '@/lib/utils';

export interface Track {
  title: string;
  trackNumber: number;
  artistSlug: string; // references Artist.slug from lib/artists.ts
  audioUrl?: string;
}

export interface Volume {
  image: string;
  title: string;
  tracks: Track[];
}

export type VolumeNumber = 1 | 2;

export const VOLUMES: Record<VolumeNumber, Volume> = {
  1: {
    image: getImagePath('/mixtape-vol-1.jpg'),
    title: 'Volume 1',
    tracks: [
      { title: 'Sauce', trackNumber: 1, artistSlug: 'young-scrimmage', audioUrl: '/audio/vol1/01-sauce.mp3' },
      { title: 'Rare Pizzas', trackNumber: 2, artistSlug: 'chad-downing', audioUrl: '/audio/vol1/02-rare-pizzas.mp3' },
      { title: 'Pizza Mind', trackNumber: 3, artistSlug: 'heartistry', audioUrl: '/audio/vol1/03-pizza-mind.mp3' },
      { title: 'DAO It', trackNumber: 4, artistSlug: 'zenfinite369', audioUrl: '/audio/vol1/04-dao-it.mp3' },
      { title: 'I Ate Myself and Want To Pie', trackNumber: 5, artistSlug: 'nicholas-kosearas', audioUrl: '/audio/vol1/05-i-ate-myself-and-want-to-pie.mp3' },
      { title: 'Pizza Shortie', trackNumber: 6, artistSlug: 'prtty-plz', audioUrl: '/audio/vol1/06-pizza-shortie.mp3' },
      { title: 'Pizza Pop', trackNumber: 7, artistSlug: 'lobo-301', audioUrl: '/audio/vol1/07-pizza-pop.mp3' },
      { title: "Wow! That's Rare Pizzas", trackNumber: 8, artistSlug: 'prtty-plz', audioUrl: '/audio/vol1/08-wows-thats-rare-pizza.mp3' },
      { title: 'Pizza Tron', trackNumber: 9, artistSlug: 'brauxelion', audioUrl: '/audio/vol1/09-pizza-tron.mp3' },
      { title: 'PizzaDAO (We in the Metaverse)', trackNumber: 10, artistSlug: 'lobo-301', audioUrl: '/audio/vol1/10-pizzadao-we-in-the-metaverse.mp3' },
      { title: "Ain't No Za (if The Homies Can't Have a Slice)", trackNumber: 11, artistSlug: 'dream-panther', audioUrl: '/audio/vol1/11-aint-no-za.mp3' },
      { title: 'Slice of Heaven', trackNumber: 12, artistSlug: 'zenfinite369', audioUrl: '/audio/vol1/12-slice-of-heaven.mp3' },
      { title: 'Molto Bene', trackNumber: 13, artistSlug: 'lobo-301', audioUrl: '/audio/vol1/13-molto-bene.mp3' },
    ],
  },
  2: {
    image: getImagePath('/mixtape-vol-2.png'),
    title: 'Volume 2',
    tracks: [
      { title: 'Opening - Back in the Kitchen', trackNumber: 1, artistSlug: 'dj-pepperoni' },
      { title: 'New York Style', trackNumber: 2, artistSlug: 'slice-master' },
      { title: 'Chicago Deep', trackNumber: 3, artistSlug: 'crust-collective' },
      { title: 'Detroit Square', trackNumber: 4, artistSlug: 'margherita-beats' },
      { title: 'California Dreams', trackNumber: 5, artistSlug: 'dj-pepperoni' },
      { title: 'Neapolitan Nights', trackNumber: 6, artistSlug: 'slice-master' },
      { title: 'Sicilian Soul', trackNumber: 7, artistSlug: 'crust-collective' },
      { title: 'White Pizza (Interlude)', trackNumber: 8, artistSlug: 'margherita-beats' },
      { title: 'Extra Cheese', trackNumber: 9, artistSlug: 'dj-pepperoni' },
      { title: 'Hot Out The Oven', trackNumber: 10, artistSlug: 'slice-master' },
      { title: 'The Crust', trackNumber: 11, artistSlug: 'crust-collective' },
      { title: 'Closing - Until Next Time', trackNumber: 12, artistSlug: 'margherita-beats' },
    ],
  },
};

/**
 * Get track titles as a simple string array for a given volume.
 * Useful for backward-compatible rendering (e.g., the homepage tracklist).
 */
export function getTrackTitles(volume: VolumeNumber): string[] {
  return VOLUMES[volume].tracks.map((t) => t.title);
}
