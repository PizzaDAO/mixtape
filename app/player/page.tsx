'use client';

import { useState, useRef, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { getImagePath } from '@/lib/utils';
import { VOLUMES, type Track } from '@/lib/tracks';

export default function PlayerPage() {
  const { isConnected } = useAccount();
  const tracks = VOLUMES[1].tracks.filter((t) => t.audioUrl);
  const coverImage = VOLUMES[1].image;

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const currentTrack = tracks[currentTrackIndex];

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onTimeUpdate = () => setCurrentTime(audio.currentTime);
    const onDurationChange = () => setDuration(audio.duration || 0);
    const onEnded = () => {
      if (currentTrackIndex < tracks.length - 1) {
        setCurrentTrackIndex((i) => i + 1);
      } else {
        setIsPlaying(false);
      }
    };

    audio.addEventListener('timeupdate', onTimeUpdate);
    audio.addEventListener('durationchange', onDurationChange);
    audio.addEventListener('ended', onEnded);

    return () => {
      audio.removeEventListener('timeupdate', onTimeUpdate);
      audio.removeEventListener('durationchange', onDurationChange);
      audio.removeEventListener('ended', onEnded);
    };
  }, [currentTrackIndex, tracks.length]);

  // Auto-play when track changes
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.load();
    if (isPlaying) {
      audio.play().catch(() => {});
    }
  }, [currentTrackIndex]);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (isPlaying) {
      audio.pause();
    } else {
      audio.play().catch(() => {});
    }
    setIsPlaying(!isPlaying);
  };

  const playTrack = (index: number) => {
    setCurrentTrackIndex(index);
    setIsPlaying(true);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const audio = audioRef.current;
    if (!audio) return;
    const t = parseFloat(e.target.value);
    audio.currentTime = t;
    setCurrentTime(t);
  };

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <audio ref={audioRef} src={currentTrack?.audioUrl ? getImagePath(currentTrack.audioUrl) : undefined} preload="metadata" />

      <nav className="container mx-auto px-4 py-6 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <img src={getImagePath('/pizzadao-records.png')} alt="PizzaDAO Records" className="h-12 w-auto invert" />
          <a href="/" className="text-2xl font-bold text-pizza-yellow font-[family-name:var(--font-naiche)]">PizzaDAO Records</a>
        </div>
        <div className="flex gap-4 items-center">
          <a href="/artists" className="text-gray-300 hover:text-white transition">Artists</a>
          <ConnectButton />
        </div>
      </nav>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-2 gap-8">
            {/* Cover + Now Playing */}
            <div>
              <div className="aspect-square rounded-lg overflow-hidden border-2 border-pizza-yellow mb-4">
                <img src={coverImage} alt="Rare Pizzas Mixtape Vol. 1" className="w-full h-full object-cover" />
              </div>

              {/* Now Playing Info */}
              <div className="text-center mb-4">
                <p className="text-sm text-gray-400 uppercase tracking-widest">Now Playing</p>
                <h2 className="text-2xl font-bold text-pizza-yellow">{currentTrack?.title}</h2>
                <p className="text-gray-400">Track {currentTrack?.trackNumber} of {tracks.length}</p>
              </div>

              {/* Progress */}
              <div className="mb-4">
                <input
                  type="range"
                  min="0"
                  max={duration || 0}
                  value={currentTime}
                  onChange={handleSeek}
                  className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-sm text-gray-400 mt-1">
                  <span>{formatTime(currentTime)}</span>
                  <span>{formatTime(duration)}</span>
                </div>
              </div>

              {/* Controls */}
              <div className="flex items-center justify-center gap-6">
                <button
                  onClick={() => currentTrackIndex > 0 && playTrack(currentTrackIndex - 1)}
                  className="text-gray-400 hover:text-white transition disabled:opacity-30"
                  disabled={currentTrackIndex === 0}
                >
                  <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z"/>
                  </svg>
                </button>

                <button
                  onClick={togglePlay}
                  className="bg-pizza-red hover:brightness-110 rounded-full p-4 transition"
                >
                  {isPlaying ? (
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
                  onClick={() => currentTrackIndex < tracks.length - 1 && playTrack(currentTrackIndex + 1)}
                  className="text-gray-400 hover:text-white transition disabled:opacity-30"
                  disabled={currentTrackIndex === tracks.length - 1}
                >
                  <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z"/>
                  </svg>
                </button>
              </div>
            </div>

            {/* Tracklist */}
            <div className="bg-gray-900 rounded-lg p-6 border-2 border-pizza-yellow">
              <h3 className="text-xl font-bold text-pizza-yellow mb-4">Tracklist — Volume 1</h3>
              <ol className="space-y-1">
                {tracks.map((track, index) => (
                  <li key={index}>
                    <button
                      onClick={() => playTrack(index)}
                      className={`w-full text-left px-3 py-2 rounded transition flex items-center gap-3 ${
                        index === currentTrackIndex
                          ? 'bg-pizza-yellow/20 text-pizza-yellow'
                          : 'hover:bg-gray-800 text-gray-300'
                      }`}
                    >
                      <span className="font-mono text-sm w-6 flex-shrink-0">
                        {index === currentTrackIndex && isPlaying ? '▶' : String(track.trackNumber).padStart(2, '0')}
                      </span>
                      <span className="text-sm">{track.title}</span>
                    </button>
                  </li>
                ))}
              </ol>

              {/* Download button for connected users */}
              {isConnected && currentTrack?.audioUrl && (
                <div className="mt-6 pt-4 border-t border-gray-700">
                  <a
                    href={getImagePath(currentTrack.audioUrl)}
                    download
                    className="inline-flex items-center gap-2 bg-pizza-yellow hover:brightness-110 text-black font-bold py-2 px-6 transition transform hover:scale-105 w-full justify-center"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/>
                    </svg>
                    Download "{currentTrack.title}"
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
