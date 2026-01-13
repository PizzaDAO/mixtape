'use client';

import { useEffect, useState } from 'react';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { getImagePath } from '@/lib/utils';

interface MixtapeMetadata {
  token_id: number;
  title: string;
  artist: string;
  cover_image_url?: string;
  duration_seconds?: number;
}

interface CollectionGridProps {
  quantity: number;
}

export function CollectionGrid({ quantity }: CollectionGridProps) {
  const [metadata, setMetadata] = useState<MixtapeMetadata | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchMetadata = async () => {
      if (!isSupabaseConfigured) {
        // Use fallback metadata when Supabase isn't configured
        setMetadata({
          token_id: 1,
          title: 'The Rare Pizzas Mixtape',
          artist: 'PizzaDAO',
          cover_image_url: getImagePath('/mixtape-vol-1.jpg'),
          duration_seconds: 3600,
        });
        setIsLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('mixtape_metadata')
          .select('*')
          .eq('token_id', 1)
          .single();

        if (error) throw error;
        setMetadata(data);
      } catch (err) {
        console.error('Failed to fetch metadata:', err);
        // Use fallback metadata on error
        setMetadata({
          token_id: 1,
          title: 'The Rare Pizzas Mixtape',
          artist: 'PizzaDAO',
          cover_image_url: getImagePath('/mixtape-vol-1.jpg'),
          duration_seconds: 3600,
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchMetadata();
  }, []);

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
        <p className="text-gray-400 mt-4">Loading collection...</p>
      </div>
    );
  }

  if (!metadata) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-400">Failed to load mixtape metadata</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {/* Display cards based on quantity owned */}
      {Array.from({ length: Math.min(quantity, 10) }).map((_, index) => (
        <div
          key={index}
          className="bg-black/50 rounded-lg overflow-hidden hover:bg-black/70 transition group"
        >
          <div className="aspect-square overflow-hidden">
            <img
              src={metadata.cover_image_url || getImagePath('/mixtape-vol-1.jpg')}
              alt={metadata.title}
              className="w-full h-full object-cover group-hover:scale-105 transition"
            />
          </div>

          <div className="p-4">
            <h3 className="font-bold text-lg mb-1">{metadata.title}</h3>
            <p className="text-gray-400 text-sm mb-4">{metadata.artist}</p>

            <div className="flex gap-2">
              <a
                href="/player"
                className="flex-1 bg-orange-600 hover:bg-orange-700 text-white text-center py-2 px-4 rounded transition text-sm font-medium"
              >
                Play
              </a>
              <button
                onClick={() => alert('Download feature coming soon!')}
                className="flex-1 bg-gray-700 hover:bg-gray-600 text-white text-center py-2 px-4 rounded transition text-sm font-medium"
              >
                Download
              </button>
            </div>
          </div>
        </div>
      ))}

      {/* Show count if more than 10 */}
      {quantity > 10 && (
        <div className="bg-black/50 rounded-lg p-8 flex items-center justify-center">
          <div className="text-center">
            <p className="text-4xl font-bold text-orange-400 mb-2">+{quantity - 10}</p>
            <p className="text-gray-400">More copies</p>
          </div>
        </div>
      )}
    </div>
  );
}
