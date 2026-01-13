'use client';

import { useEffect, useRef } from 'react';
import { useAudioPlayer } from '@/hooks/useAudioPlayer';
import { useListeningTracker } from '@/hooks/useListeningTracker';
import { formatDuration } from '@/lib/constants';

interface MixtapePlayerProps {
  audioUrl: string;
  title: string;
  artist: string;
  coverImageUrl?: string;
}

export function MixtapePlayer({ audioUrl, title, artist, coverImageUrl }: MixtapePlayerProps) {
  const {
    isPlaying,
    currentTime,
    duration,
    volume,
    isLoading,
    error,
    togglePlay,
    seek,
    changeVolume,
  } = useAudioPlayer(audioUrl);

  const { startSession, trackTime, endSession, sessionId, totalSessionTime } = useListeningTracker();

  const trackingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const playTimeRef = useRef<number>(0);

  // Start session when component mounts
  useEffect(() => {
    startSession();
    return () => {
      endSession();
    };
  }, []);

  // Track listening time every 30 seconds when playing
  useEffect(() => {
    if (isPlaying) {
      // Clear any existing interval
      if (trackingIntervalRef.current) {
        clearInterval(trackingIntervalRef.current);
      }

      // Track time every 30 seconds
      trackingIntervalRef.current = setInterval(() => {
        playTimeRef.current += 30;
        trackTime(playTimeRef.current);
      }, 30000);
    } else {
      // Clear interval when paused
      if (trackingIntervalRef.current) {
        clearInterval(trackingIntervalRef.current);
        trackingIntervalRef.current = null;
      }
    }

    return () => {
      if (trackingIntervalRef.current) {
        clearInterval(trackingIntervalRef.current);
      }
    };
  }, [isPlaying]);

  // Track play time continuously (for display, not backend)
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isPlaying) {
      interval = setInterval(() => {
        playTimeRef.current += 1;
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isPlaying]);

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = parseFloat(e.target.value);
    seek(newTime);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    changeVolume(newVolume);
  };

  if (error) {
    return (
      <div className="bg-red-900/30 border border-red-500 rounded-lg p-8 text-center">
        <p className="text-red-400">Error: {error}</p>
      </div>
    );
  }

  return (
    <div className="bg-black/50 rounded-lg p-8 max-w-2xl mx-auto">
      {/* Cover Art */}
      <div className="aspect-square rounded-lg mb-6 overflow-hidden">
        <img
          src={coverImageUrl || '/mixtape-vol-1.jpg'}
          alt={title}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Track Info */}
      <div className="text-center mb-6">
        <h2 className="text-3xl font-bold mb-2">{title}</h2>
        <p className="text-xl text-gray-400">{artist}</p>
      </div>

      {/* Progress Bar */}
      <div className="mb-6">
        <input
          type="range"
          min="0"
          max={duration || 0}
          value={currentTime}
          onChange={handleSeek}
          className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
          disabled={isLoading}
        />
        <div className="flex justify-between text-sm text-gray-400 mt-2">
          <span>{formatDuration(Math.floor(currentTime))}</span>
          <span>{formatDuration(Math.floor(duration))}</span>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-6 mb-6">
        <button
          onClick={() => seek(Math.max(0, currentTime - 10))}
          className="text-gray-400 hover:text-white transition"
          disabled={isLoading}
        >
          <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
            <path d="M11.99 5V1l-5 5 5 5V7c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6h-2c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8z"/>
            <text x="9" y="16" fontSize="8" fill="currentColor">10</text>
          </svg>
        </button>

        <button
          onClick={togglePlay}
          className="bg-orange-600 hover:bg-orange-700 rounded-full p-4 transition disabled:bg-gray-600"
          disabled={isLoading}
        >
          {isLoading ? (
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
          ) : isPlaying ? (
            <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
              <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"/>
            </svg>
          ) : (
            <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z"/>
            </svg>
          )}
        </button>

        <button
          onClick={() => seek(Math.min(duration, currentTime + 10))}
          className="text-gray-400 hover:text-white transition"
          disabled={isLoading}
        >
          <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 5V1l5 5-5 5V7c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6h2c0 4.42-3.58 8-8 8s-8-3.58-8-8 3.58-8 8-8z"/>
            <text x="9" y="16" fontSize="8" fill="currentColor">10</text>
          </svg>
        </button>
      </div>

      {/* Volume Control */}
      <div className="flex items-center gap-4 mb-6">
        <svg className="w-6 h-6 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
          <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z"/>
        </svg>
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={volume}
          onChange={handleVolumeChange}
          className="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
        />
        <span className="text-sm text-gray-400 w-12 text-right">{Math.round(volume * 100)}%</span>
      </div>

      {/* Session Info */}
      {sessionId && (
        <div className="text-center text-sm text-gray-400">
          <p>Session time: {formatDuration(playTimeRef.current)}</p>
          {totalSessionTime > 0 && (
            <p className="text-xs">Last saved: {formatDuration(totalSessionTime)}</p>
          )}
        </div>
      )}
    </div>
  );
}
