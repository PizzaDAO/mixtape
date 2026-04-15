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

// TODO: Replace placeholder data with real artist information from the PizzaDAO team
export const ARTISTS: Artist[] = [
  {
    slug: 'dj-pepperoni',
    // TODO: Replace with real artist name
    name: 'DJ Pepperoni',
    // TODO: Replace with real bio
    bio: 'DJ Pepperoni has been spinning records since before blockchain was cool. A founding member of the PizzaDAO music collective, their beats blend lo-fi hip-hop with Web3 culture to create something truly unique. When not in the studio, they can be found minting rare slices and vibing in the metaverse.',
    // TODO: Replace with real artist photo (place in public/artists/)
    photoUrl: '/artists/placeholder.svg',
    socials: {
      // TODO: Add real social links
      twitter: 'https://twitter.com/example',
      spotify: 'https://open.spotify.com/artist/example',
      website: 'https://example.com',
    },
    tracks: [
      { title: 'Sauce', volume: 1, trackNumber: 1 },
      { title: 'Pizza Mind', volume: 1, trackNumber: 3 },
      { title: "Wow! That's Rare Pizzas", volume: 1, trackNumber: 8 },
      { title: 'Molto Bene', volume: 1, trackNumber: 13 },
      { title: 'Opening - Back in the Kitchen', volume: 2, trackNumber: 1 },
      { title: 'California Dreams', volume: 2, trackNumber: 5 },
      { title: 'Extra Cheese', volume: 2, trackNumber: 9 },
    ],
  },
  {
    slug: 'slice-master',
    // TODO: Replace with real artist name
    name: 'Slice Master',
    // TODO: Replace with real bio
    bio: 'Slice Master brings the heat with every track. Known for their signature synth-heavy production style, they have been a key contributor to both volumes of the Rare Pizzas Mixtape. Their sound draws from classic hip-hop, electronic, and the unmistakable energy of pizza culture.',
    // TODO: Replace with real artist photo (place in public/artists/)
    photoUrl: '/artists/placeholder.svg',
    socials: {
      // TODO: Add real social links
      twitter: 'https://twitter.com/example',
      instagram: 'https://instagram.com/example',
      soundcloud: 'https://soundcloud.com/example',
    },
    tracks: [
      { title: 'Rare Pizzas', volume: 1, trackNumber: 2 },
      { title: 'I Ate Myself and Want To Pie', volume: 1, trackNumber: 5 },
      { title: 'PizzaDAO (We in the Metaverse)', volume: 1, trackNumber: 10 },
      { title: 'Rare Pizzas Mixtape Outro', volume: 1, trackNumber: 14 },
      { title: 'New York Style', volume: 2, trackNumber: 2 },
      { title: 'Neapolitan Nights', volume: 2, trackNumber: 6 },
      { title: 'Hot Out The Oven', volume: 2, trackNumber: 10 },
    ],
  },
  {
    slug: 'crust-collective',
    // TODO: Replace with real artist name
    name: 'Crust Collective',
    // TODO: Replace with real bio
    bio: 'Crust Collective is a group of producers who came together through PizzaDAO. Their collaborative approach to music-making means every track has a different flavor, but always keeps that signature crispy edge. They believe music, like pizza, is best when shared with the community.',
    // TODO: Replace with real artist photo (place in public/artists/)
    photoUrl: '/artists/placeholder.svg',
    socials: {
      // TODO: Add real social links
      twitter: 'https://twitter.com/example',
      instagram: 'https://instagram.com/example',
      website: 'https://example.com',
    },
    tracks: [
      { title: 'DAO It', volume: 1, trackNumber: 4 },
      { title: 'Pizza Tron', volume: 1, trackNumber: 9 },
      { title: "Ain't No Za (if The Homies Can't Have a Slice)", volume: 1, trackNumber: 11 },
      { title: 'Chicago Deep', volume: 2, trackNumber: 3 },
      { title: 'Sicilian Soul', volume: 2, trackNumber: 7 },
      { title: 'The Crust', volume: 2, trackNumber: 11 },
    ],
  },
  {
    slug: 'margherita-beats',
    // TODO: Replace with real artist name
    name: 'Margherita Beats',
    // TODO: Replace with real bio
    bio: 'Margherita Beats keeps it simple and classic, just like their namesake. With a focus on melody and groove, their productions bring a soulful warmth to the mixtape. A true believer in the intersection of music and decentralized culture, they have been part of PizzaDAO since day one.',
    // TODO: Replace with real artist photo (place in public/artists/)
    photoUrl: '/artists/placeholder.svg',
    socials: {
      // TODO: Add real social links
      spotify: 'https://open.spotify.com/artist/example',
      soundcloud: 'https://soundcloud.com/example',
    },
    tracks: [
      { title: 'Pizza Shortie', volume: 1, trackNumber: 6 },
      { title: 'Pizza Pop', volume: 1, trackNumber: 7 },
      { title: 'Slice of Heaven', volume: 1, trackNumber: 12 },
      { title: 'Detroit Square', volume: 2, trackNumber: 4 },
      { title: 'White Pizza (Interlude)', volume: 2, trackNumber: 8 },
      { title: 'Closing - Until Next Time', volume: 2, trackNumber: 12 },
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
