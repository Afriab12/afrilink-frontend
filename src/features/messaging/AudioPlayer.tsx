'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Volume2, VolumeX, Play, Pause, Loader2 } from 'lucide-react';
import { voiceService } from '@/services/voiceService';

interface AudioPlayerProps {
  audioUrl?: string;
  textToSpeak?: string;
  languageCode?: string;
  isMine?: boolean;
  className?: string;
}

export const AudioPlayer: React.FC<AudioPlayerProps> = ({
  audioUrl,
  textToSpeak,
  languageCode = 'en',
  isMine = false,
  className = '',
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Clean up audio on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      voiceService.stopSpeaking();
    };
  }, []);

  const handleTogglePlay = async (e: React.MouseEvent) => {
    e.stopPropagation();

    // If currently playing, stop it
    if (isPlaying) {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      voiceService.stopSpeaking();
      setIsPlaying(false);
      return;
    }

    // Play remote audioUrl if present
    if (audioUrl) {
      setIsLoading(true);
      try {
        if (!audioRef.current) {
          audioRef.current = new Audio(audioUrl);
          audioRef.current.onended = () => setIsPlaying(false);
          audioRef.current.onerror = () => {
            setIsPlaying(false);
            setIsLoading(false);
          };
        }
        await audioRef.current.play();
        setIsPlaying(true);
      } catch {
        // Fallback to textToSpeak if audio stream fails
        if (textToSpeak) {
          speakFallback();
        }
      } finally {
        setIsLoading(false);
      }
      return;
    }

    // Otherwise utilize Text-to-Speech synthesis
    if (textToSpeak) {
      speakFallback();
    }
  };

  const speakFallback = async () => {
    if (!textToSpeak) return;
    setIsPlaying(true);
    const completed = await voiceService.speakText(textToSpeak, languageCode);
    setIsPlaying(false);
  };

  return (
    <button
      type="button"
      onClick={handleTogglePlay}
      disabled={isLoading || (!audioUrl && !textToSpeak)}
      className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-xl text-[11px] font-medium transition active:scale-95 touch-manipulation focus:outline-none focus:ring-1 focus:ring-[#D9A441] ${
        isMine
          ? isPlaying
            ? 'bg-emerald-900 text-white'
            : 'bg-emerald-700/60 text-white/90 hover:bg-emerald-700'
          : isPlaying
          ? 'bg-emerald-100 dark:bg-emerald-950/60 text-[#087443] dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800'
          : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700'
      } ${className}`}
      aria-label={isPlaying ? 'Pause audio message' : 'Listen to message'}
      title={isPlaying ? 'Pause audio' : 'Listen to message'}
    >
      {isLoading ? (
        <Loader2 className="w-3 h-3 animate-spin text-current" />
      ) : isPlaying ? (
        <>
          <div className="flex items-center gap-0.5 h-3">
            <span className="w-0.5 h-full bg-current animate-pulse" />
            <span className="w-0.5 h-2 bg-current animate-pulse delay-75" />
            <span className="w-0.5 h-3 bg-current animate-pulse delay-150" />
          </div>
          <span>Playing</span>
        </>
      ) : (
        <>
          <Volume2 className="w-3 h-3 text-current" />
          <span>Listen</span>
        </>
      )}
    </button>
  );
};
