export interface ArtistSocials {
  twitter?: string;
  instagram?: string;
  spotify?: string;
  soundcloud?: string;
  website?: string;
}

export interface ArtistTrack {
  title: string;
  volume: 1 | 2;
  trackNumber: number;
}

export interface Artist {
  slug: string;
  name: string;
  bio: string;
  photoUrl: string;
  socials: ArtistSocials;
  tracks: ArtistTrack[];
}

export const ARTISTS: Artist[] = [
  {
    slug: 'young-scrimmage',
    name: 'Young Scrimmage',
    bio: '',
    photoUrl: '/artists/placeholder.svg',
    socials: {},
    tracks: [
      { title: 'Sauce', volume: 1, trackNumber: 1 },
    ],
  },
  {
    slug: 'ife-senoj',
    name: 'IFE SENOJ',
    bio: '',
    photoUrl: '/artists/placeholder.svg',
    socials: {},
    tracks: [
      { title: 'Sauce', volume: 1, trackNumber: 1 },
    ],
  },
  {
    slug: 'taj',
    name: 'TAJ.',
    bio: '',
    photoUrl: '/artists/placeholder.svg',
    socials: {},
    tracks: [
      { title: 'Sauce', volume: 1, trackNumber: 1 },
    ],
  },
  {
    slug: 'chad-downing',
    name: 'Chad Downing',
    bio: '',
    photoUrl: '/artists/placeholder.svg',
    socials: {},
    tracks: [
      { title: 'Rare Pizzas', volume: 1, trackNumber: 2 },
    ],
  },
  {
    slug: 'heartistry',
    name: 'Heartistry',
    bio: '',
    photoUrl: '/artists/placeholder.svg',
    socials: {},
    tracks: [
      { title: 'Pizza Mind', volume: 1, trackNumber: 3 },
    ],
  },
  {
    slug: 'zenfinite369',
    name: 'Zenfinite369',
    bio: '',
    photoUrl: '/artists/placeholder.svg',
    socials: {},
    tracks: [
      { title: 'DAO It', volume: 1, trackNumber: 4 },
      { title: 'Slice of Heaven', volume: 1, trackNumber: 12 },
    ],
  },
  {
    slug: 'nicholas-kosearas',
    name: 'Nicholas Kosearas',
    bio: '',
    photoUrl: '/artists/placeholder.svg',
    socials: {},
    tracks: [
      { title: 'I Ate Myself and Want To Pie', volume: 1, trackNumber: 5 },
    ],
  },
  {
    slug: 'prtty-plz',
    name: 'Prtty Plz',
    bio: '',
    photoUrl: '/artists/placeholder.svg',
    socials: {},
    tracks: [
      { title: 'Pizza Shortie', volume: 1, trackNumber: 6 },
      { title: "Wow! That's Rare Pizzas", volume: 1, trackNumber: 8 },
    ],
  },
  {
    slug: 'lobo-301',
    name: 'LoBo_301',
    bio: '',
    photoUrl: '/artists/placeholder.svg',
    socials: {},
    tracks: [
      { title: 'Pizza Pop', volume: 1, trackNumber: 7 },
      { title: 'PizzaDAO (We in the Metaverse)', volume: 1, trackNumber: 10 },
      { title: 'Molto Bene', volume: 1, trackNumber: 13 },
    ],
  },
  {
    slug: 'brauxelion',
    name: 'Brauxelion',
    bio: '',
    photoUrl: '/artists/placeholder.svg',
    socials: {},
    tracks: [
      { title: 'Pizza Tron', volume: 1, trackNumber: 9 },
    ],
  },
  {
    slug: 'dream-panther',
    name: 'Dream Panther',
    bio: '',
    photoUrl: '/artists/placeholder.svg',
    socials: {},
    tracks: [
      { title: "Ain't No Za (if The Homies Can't Have a Slice)", volume: 1, trackNumber: 11 },
    ],
  },
];

/** Look up a single artist by their URL slug. */
export function getArtistBySlug(slug: string): Artist | undefined {
  return ARTISTS.find((a) => a.slug === slug);
}

/** Return all artists who have at least one track on the given volume. */
export function getArtistsByVolume(volume: 1 | 2): Artist[] {
  return ARTISTS.filter((a) => a.tracks.some((t) => t.volume === volume));
}

/** Find the artist for a specific track title + volume combination. */
export function getArtistForTrack(title: string, volume: 1 | 2): Artist | undefined {
  return ARTISTS.find((a) =>
    a.tracks.some((t) => t.title === title && t.volume === volume)
  );
}
