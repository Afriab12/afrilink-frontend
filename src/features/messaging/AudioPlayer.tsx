'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Volume2, Play, Pause, Loader2 } from 'lucide-react';
import { voiceService } from '@/services/voiceService';

interface AudioPlayerProps {
  audioUrl?: string;
  textToSpeak?: string;
  languageCode?: string;
  isMine?: boolean;
  className?: string;
  duration?: string;
}

export const AudioPlayer: React.FC<AudioPlayerProps> = ({
  audioUrl,
  textToSpeak,
  languageCode = 'en',
  isMine = false,
  className = '',
  duration = '0:32',
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
    await voiceService.speakText(textToSpeak, languageCode);
    setIsPlaying(false);
  };

  // If this is an audio message with an audioUrl, render the full Voice Bubble player
  if (audioUrl) {
    return (
      <div className={`flex items-center gap-3 py-1 select-none ${className}`}>
        {/* Play 32x32 rounded-full button */}
        <button
          type="button"
          onClick={handleTogglePlay}
          disabled={isLoading}
          className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/15 text-white flex items-center justify-center transition-colors shrink-0 active:scale-95 pointer-events-auto cursor-pointer"
          aria-label={isPlaying ? 'Pause audio' : 'Play voice message'}
          title={isPlaying ? 'Pause' : 'Play'}
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin text-white" strokeWidth={1.75} />
          ) : isPlaying ? (
            <Pause className="h-4 w-4 text-emerald-400" strokeWidth={1.75} />
          ) : (
            <Play className="h-4 w-4 ml-0.5 text-white" strokeWidth={1.75} />
          )}
        </button>

        {/* CSS Waveform Bars (transform/opacity) */}
        <div className="flex items-center gap-0.5 h-6 flex-1 px-1 overflow-hidden" aria-hidden="true">
          <span className={`w-0.5 h-2 rounded-full ${isPlaying ? 'bg-emerald-400 animate-pulse' : 'bg-white/30'} motion-reduce:animate-none`} />
          <span className={`w-0.5 h-4 rounded-full ${isPlaying ? 'bg-emerald-400 animate-pulse delay-75' : 'bg-white/40'} motion-reduce:animate-none`} />
          <span className={`w-0.5 h-3 rounded-full ${isPlaying ? 'bg-emerald-400 animate-pulse delay-150' : 'bg-white/30'} motion-reduce:animate-none`} />
          <span className={`w-0.5 h-5 rounded-full ${isPlaying ? 'bg-emerald-400 animate-pulse delay-100' : 'bg-white/50'} motion-reduce:animate-none`} />
          <span className={`w-0.5 h-2.5 rounded-full ${isPlaying ? 'bg-emerald-400 animate-pulse delay-200' : 'bg-white/40'} motion-reduce:animate-none`} />
          <span className={`w-0.5 h-4.5 rounded-full ${isPlaying ? 'bg-emerald-400 animate-pulse delay-300' : 'bg-white/50'} motion-reduce:animate-none`} />
          <span className={`w-0.5 h-2 rounded-full ${isPlaying ? 'bg-emerald-400 animate-pulse delay-150' : 'bg-white/30'} motion-reduce:animate-none`} />
          <span className={`w-0.5 h-3.5 rounded-full ${isPlaying ? 'bg-emerald-400 animate-pulse delay-75' : 'bg-white/40'} motion-reduce:animate-none`} />
          <span className={`w-0.5 h-5 rounded-full ${isPlaying ? 'bg-emerald-400 animate-pulse delay-250' : 'bg-white/50'} motion-reduce:animate-none`} />
          <span className={`w-0.5 h-2.5 rounded-full ${isPlaying ? 'bg-emerald-400 animate-pulse delay-100' : 'bg-white/30'} motion-reduce:animate-none`} />
          <span className={`w-0.5 h-4 rounded-full ${isPlaying ? 'bg-emerald-400 animate-pulse delay-200' : 'bg-white/40'} motion-reduce:animate-none`} />
          <span className={`w-0.5 h-1.5 rounded-full ${isPlaying ? 'bg-emerald-400 animate-pulse delay-150' : 'bg-white/20'} motion-reduce:animate-none`} />
        </div>

        {/* Duration text-xs font-mono text-white/60 */}
        <span className="text-xs font-mono text-white/60 shrink-0">
          {duration}
        </span>
      </div>
    );
  }

  // Fallback: Text-to-speech speaker button
  return (
    <button
      type="button"
      onClick={handleTogglePlay}
      disabled={isLoading || !textToSpeak}
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg text-[10px] font-medium transition-colors active:scale-95 text-white/40 hover:text-white/70 hover:bg-white/[0.04] pointer-events-auto cursor-pointer ${className}`}
      aria-label={isPlaying ? 'Stop audio' : 'Listen to message'}
      title={isPlaying ? 'Stop' : 'Listen'}
    >
      {isLoading ? (
        <Loader2 className="h-3 w-3 animate-spin text-white/40" strokeWidth={1.75} />
      ) : (
        <Volume2 className="h-3 w-3 text-white/40" strokeWidth={1.75} />
      )}
      <span>{isPlaying ? 'Playing...' : 'Listen'}</span>
    </button>
  );
};
