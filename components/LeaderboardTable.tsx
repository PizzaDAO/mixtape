'use client';

import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase, isSupabaseConfigured, type User } from '@/lib/supabase';
import { formatDuration, formatAddress } from '@/lib/constants';

function UserDisplay({ user }: { user: User }) {
  const displayName = user.ens_name || formatAddress(user.wallet_address);

  return (
    <div className="flex items-center gap-2">
      <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-red-600 rounded-full flex items-center justify-center text-sm">
        {user.ens_name ? user.ens_name[0].toUpperCase() : '?'}
      </div>
      <div>
        <p className="font-medium">{displayName}</p>
        {user.ens_name && (
          <p className="text-xs text-gray-500">{formatAddress(user.wallet_address)}</p>
        )}
      </div>
    </div>
  );
}

export function LeaderboardTable() {
  const { data: leaderboard, isLoading, error, refetch } = useQuery({
    queryKey: ['leaderboard'],
    queryFn: async () => {
      if (!isSupabaseConfigured) {
        throw new Error('Supabase is not configured. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in your environment variables.');
      }

      const { data, error } = await supabase
        .from('users')
        .select('id, wallet_address, ens_name, total_listening_time, mixtapes_owned')
        .order('total_listening_time', { ascending: false })
        .limit(100);

      if (error) throw error;
      return data as User[];
    },
    refetchInterval: 30000, // Refresh every 30 seconds
    enabled: isSupabaseConfigured, // Only run query if Supabase is configured
  });

  if (!isSupabaseConfigured) {
    return (
      <div className="bg-yellow-900/30 border border-yellow-500 rounded-lg p-8 text-center">
        <div className="text-5xl mb-4">⚙️</div>
        <h3 className="text-xl font-bold mb-2 text-yellow-400">Supabase Not Configured</h3>
        <p className="text-gray-300 text-sm">
          Set up your Supabase project and add environment variables to enable the leaderboard.
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-900/30 border border-red-500 rounded-lg p-8 text-center">
        <p className="text-red-400">Failed to load leaderboard</p>
        <button
          onClick={() => refetch()}
          className="mt-4 bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-6 rounded-lg transition"
        >
          Retry
        </button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
        <p className="text-gray-400">Loading leaderboard...</p>
      </div>
    );
  }

  if (!leaderboard || leaderboard.length === 0) {
    return (
      <div className="bg-black/50 rounded-lg p-12 text-center">
        <div className="text-6xl mb-4">🎵</div>
        <h3 className="text-2xl font-bold mb-2">No Listeners Yet</h3>
        <p className="text-gray-400">Be the first to listen and claim the top spot!</p>
      </div>
    );
  }

  // Filter out users with 0 listening time
  const activeListeners = leaderboard.filter((user) => user.total_listening_time > 0);

  if (activeListeners.length === 0) {
    return (
      <div className="bg-black/50 rounded-lg p-12 text-center">
        <div className="text-6xl mb-4">🎵</div>
        <h3 className="text-2xl font-bold mb-2">No Listening Activity Yet</h3>
        <p className="text-gray-400">Start listening to appear on the leaderboard!</p>
      </div>
    );
  }

  return (
    <div className="bg-black/50 rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-black/50">
            <tr className="border-b border-gray-700">
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Rank</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">User</th>
              <th className="px-6 py-4 text-right text-sm font-semibold text-gray-300">Listening Time</th>
              <th className="px-6 py-4 text-right text-sm font-semibold text-gray-300">Mixtapes Owned</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {activeListeners.map((user, index) => (
              <tr
                key={user.id}
                className={`hover:bg-black/30 transition ${
                  index === 0
                    ? 'bg-gradient-to-r from-yellow-900/20 to-transparent'
                    : index === 1
                    ? 'bg-gradient-to-r from-gray-700/20 to-transparent'
                    : index === 2
                    ? 'bg-gradient-to-r from-orange-900/20 to-transparent'
                    : ''
                }`}
              >
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    {index === 0 && <span className="text-2xl">🥇</span>}
                    {index === 1 && <span className="text-2xl">🥈</span>}
                    {index === 2 && <span className="text-2xl">🥉</span>}
                    <span className="font-bold text-lg">{index + 1}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <UserDisplay user={user} />
                </td>
                <td className="px-6 py-4 text-right">
                  <span className="text-orange-400 font-bold text-lg">
                    {formatDuration(user.total_listening_time)}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <span className="text-gray-400">{user.mixtapes_owned}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="px-6 py-4 bg-black/30 border-t border-gray-800 text-center">
        <p className="text-sm text-gray-400">
          Showing {activeListeners.length} {activeListeners.length === 1 ? 'listener' : 'listeners'}
          {' • '}
          Updates every 30 seconds
        </p>
      </div>
    </div>
  );
}
