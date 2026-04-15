'use client';

import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { MixtapePlayer } from '@/components/MixtapePlayer';
import { useMixtapeOwnership } from '@/hooks/useMixtapeOwnership';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { getImagePath } from '@/lib/utils';

interface MixtapeMetadata {
  title: string;
  artist: string;
  cover_image_url?: string;
}

export default function PlayerPage() {
  const { address, isConnected } = useAccount();
  const { ownsNFT, isLoading: isCheckingOwnership, isContractMisconfigured } = useMixtapeOwnership(address);

  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [metadata, setMetadata] = useState<MixtapeMetadata | null>(null);
  const [isLoadingAudio, setIsLoadingAudio] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch metadata
  useEffect(() => {
    const fetchMetadata = async () => {
      if (!isSupabaseConfigured) {
        // Use fallback metadata when Supabase isn't configured
        setMetadata({
          title: 'The Rare Pizzas Mixtape',
          artist: 'PizzaDAO',
          cover_image_url: getImagePath('/mixtape-vol-1.jpg'),
        });
        return;
      }

      try {
        const { data, error } = await supabase
          .from('mixtape_metadata')
          .select('title, artist, cover_image_url')
          .eq('token_id', 1)
          .single();

        if (error) throw error;
        setMetadata(data);
      } catch (err) {
        console.error('Failed to fetch metadata:', err);
        // Use fallback metadata on error
        setMetadata({
          title: 'The Rare Pizzas Mixtape',
          artist: 'PizzaDAO',
          cover_image_url: getImagePath('/mixtape-vol-1.jpg'),
        });
      }
    };

    fetchMetadata();
  }, []);

  // Fetch audio URL when user owns NFT
  useEffect(() => {
    if (!address || !ownsNFT) return;

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      setError(
        'Audio service is not configured. Please contact the site administrator.'
      );
      return;
    }

    const fetchAudioUrl = async () => {
      setIsLoadingAudio(true);
      setError(null);

      try {
        const response = await fetch(
          `${supabaseUrl}/functions/v1/verify-ownership`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${supabaseAnonKey}`,
            },
            body: JSON.stringify({ userAddress: address }),
          }
        );

        // Validate content-type before parsing as JSON
        const contentType = response.headers.get('content-type') || '';
        if (!contentType.includes('application/json')) {
          console.error('Unexpected content-type from verify-ownership:', contentType);
          setError('Audio service returned an unexpected response. Please try again later.');
          return;
        }

        const data = await response.json();

        if (response.ok && data.authorized) {
          setAudioUrl(data.audioUrl);
        } else {
          setError(data.message || data.error || 'Failed to load audio');
        }
      } catch (err) {
        console.error('Failed to fetch audio URL:', err);
        setError('Could not connect to the audio service. Please check your connection and try again.');
      } finally {
        setIsLoadingAudio(false);
      }
    };

    fetchAudioUrl();
  }, [address, ownsNFT]);

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-pizza-red text-white">
        <nav className="container mx-auto px-4 py-6 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <img src={getImagePath('/pizzadao-records.svg')} alt="PizzaDAO Records" className="h-12 w-auto" />
            <a href="/" className="text-2xl font-bold">Mixtape</a>
          </div>
          <ConnectButton />
        </nav>

        <main className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-5xl font-bold mb-6">Connect Wallet</h1>
          <p className="text-2xl mb-8">
            Connect your wallet to listen to the mixtape
          </p>
          <ConnectButton />
        </main>
      </div>
    );
  }

  if (isContractMisconfigured) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-purple-900 to-black text-white">
        <nav className="container mx-auto px-4 py-6 flex justify-between items-center">
          <a href="/" className="text-2xl font-bold">PizzaDAO Mixtape</a>
          <ConnectButton />
        </nav>

        <main className="container mx-auto px-4 py-16 text-center">
          <div className="bg-yellow-900/30 border border-yellow-500 rounded-lg p-8 max-w-2xl mx-auto">
            <p className="text-yellow-400 text-xl mb-4">Configuration Error</p>
            <p className="text-gray-300">
              The NFT contract is not configured correctly. Please contact the site administrator.
            </p>
          </div>
        </main>
      </div>
    );
  }

  if (isCheckingOwnership) {
    return (
      <div className="min-h-screen bg-black text-white">
        <nav className="container mx-auto px-4 py-6 flex justify-between items-center">
          <a href="/" className="text-2xl font-bold text-pizza-yellow">PizzaDAO Mixtape</a>
          <ConnectButton />
        </nav>

        <main className="container mx-auto px-4 py-16 text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-pizza-yellow mx-auto mb-4"></div>
          <p className="text-xl text-gray-400">Checking ownership...</p>
        </main>
      </div>
    );
  }

  if (!ownsNFT) {
    return (
      <div className="min-h-screen bg-black text-white">
        <nav className="container mx-auto px-4 py-6 flex justify-between items-center">
          <a href="/" className="text-2xl font-bold text-pizza-yellow">PizzaDAO Mixtape</a>
          <ConnectButton />
        </nav>

        <main className="container mx-auto px-4 py-16 text-center">
          <div className="text-6xl mb-6">🔒</div>
          <h1 className="text-4xl font-bold mb-6">Access Denied</h1>
          <p className="text-xl text-gray-400 mb-8">
            You need to own the PizzaDAO Mixtape NFT to listen
          </p>
          <a
            href="/"
            className="inline-block bg-pizza-red hover:brightness-110 text-white font-bold py-3 px-8 rounded-lg transition"
          >
            Purchase Mixtape
          </a>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <nav className="container mx-auto px-4 py-6 flex justify-between items-center">
        <a href="/" className="text-2xl font-bold text-pizza-yellow">PizzaDAO Mixtape</a>
        <div className="flex gap-4 items-center">
          <a href="/collection" className="text-gray-300 hover:text-pizza-yellow transition">
            Collection
          </a>
          <a href="/leaderboard" className="text-gray-300 hover:text-pizza-yellow transition">
            Leaderboard
          </a>
          <a href="/artists" className="text-gray-300 hover:text-white transition">
            Artists
          </a>
          <ConnectButton />
        </div>
      </nav>

      <main className="container mx-auto px-4 py-16">
        <h1 className="text-4xl font-bold mb-8 text-center text-pizza-yellow">Now Playing</h1>

        {isLoadingAudio ? (
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-pizza-yellow mx-auto mb-4"></div>
            <p className="text-xl text-gray-400">Loading audio...</p>
          </div>
        ) : error ? (
          <div className="bg-red-900/30 border border-pizza-red rounded-lg p-8 max-w-2xl mx-auto text-center">
            <p className="text-pizza-red mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-6 rounded-lg transition"
            >
              Retry
            </button>
          </div>
        ) : audioUrl && metadata ? (
          <MixtapePlayer
            audioUrl={audioUrl}
            title={metadata.title}
            artist={metadata.artist}
            coverImageUrl={metadata.cover_image_url}
          />
        ) : (
          <div className="text-center text-gray-400">
            <p>Failed to load mixtape</p>
          </div>
        )}
      </main>
    </div>
  );
}
