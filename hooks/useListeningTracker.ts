import { useEffect, useState, useRef } from 'react';
import { useAccount } from 'wagmi';
import { supabase } from '@/lib/supabase';

export function useListeningTracker() {
  const { address } = useAccount();
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [totalSessionTime, setTotalSessionTime] = useState(0);
  const lastUpdateRef = useRef<number>(Date.now());
  const accumulatedTimeRef = useRef<number>(0);

  const startSession = async () => {
    if (!address) return;

    try {
      const { data, error } = await supabase
        .from('listening_sessions')
        .insert({
          wallet_address: address.toLowerCase(),
          started_at: new Date().toISOString(),
          duration_seconds: 0,
        })
        .select()
        .single();

      if (error) throw error;

      setSessionId(data.id);
      lastUpdateRef.current = Date.now();
      accumulatedTimeRef.current = 0;
      setTotalSessionTime(0);
    } catch (error) {
      console.error('Failed to start listening session:', error);
    }
  };

  const trackTime = async (seconds: number) => {
    if (!sessionId || !address) return;

    try {
      // Update session duration
      await supabase
        .from('listening_sessions')
        .update({
          duration_seconds: seconds,
          ended_at: new Date().toISOString(),
        })
        .eq('id', sessionId);

      // Increment user's total listening time
      await supabase.rpc('increment_listening_time', {
        user_address: address.toLowerCase(),
        seconds: seconds - totalSessionTime, // Only increment the difference
      });

      setTotalSessionTime(seconds);
    } catch (error) {
      console.error('Failed to track listening time:', error);
    }
  };

  const endSession = async () => {
    if (!sessionId || !address) return;

    try {
      await supabase
        .from('listening_sessions')
        .update({
          ended_at: new Date().toISOString(),
        })
        .eq('id', sessionId);

      setSessionId(null);
      setTotalSessionTime(0);
      accumulatedTimeRef.current = 0;
    } catch (error) {
      console.error('Failed to end session:', error);
    }
  };

  return {
    startSession,
    trackTime,
    endSession,
    sessionId,
    totalSessionTime,
  };
}
