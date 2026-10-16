'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Mic, Square, Trash2, Send, AlertCircle, Loader2 } from 'lucide-react';
import { voiceService } from '@/services/voiceService';

interface VoiceRecorderProps {
  onSendVoice: (audioBlob: Blob, durationSeconds: number) => void;
  disabled?: boolean;
}

export const VoiceRecorder: React.FC<VoiceRecorderProps> = ({
  onSendVoice,
  disabled = false,
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<any>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const isSupported = typeof window !== 'undefined' && voiceService.isRecordingSupported();

  useEffect(() => {
    return () => {
      cleanupRecording();
    };
  }, []);

  const cleanupRecording = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      try {
        mediaRecorderRef.current.stop();
      } catch {
        // Safe ignore
      }
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    audioChunksRef.current = [];
    setIsRecording(false);
  };

  const startRecording = async () => {
    setErrorMessage(null);
    if (!isSupported) {
      setErrorMessage('Audio recording is not supported on this browser.');
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      // Select supported audio mime type
      let mimeType = 'audio/webm';
      if (typeof MediaRecorder !== 'undefined') {
        if (MediaRecorder.isTypeSupported('audio/webm;codecs=opus')) {
          mimeType = 'audio/webm;codecs=opus';
        } else if (MediaRecorder.isTypeSupported('audio/mp4')) {
          mimeType = 'audio/mp4';
        } else if (MediaRecorder.isTypeSupported('audio/ogg')) {
          mimeType = 'audio/ogg';
        }
      }

      const recorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = recorder;
      audioChunksRef.current = [];

      recorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      recorder.start(100); // 100ms chunks
      setIsRecording(true);
      setRecordingSeconds(0);

      timerRef.current = setInterval(() => {
        setRecordingSeconds((prev) => {
          if (prev >= 120) {
            // Auto-stop at 2 minutes limit
            stopAndSend();
            return prev;
          }
          return prev + 1;
        });
      }, 1000);
    } catch (err: any) {
      if (err?.name === 'NotAllowedError' || err?.name === 'PermissionDeniedError') {
        setErrorMessage('Microphone access denied. Please grant permission in browser settings.');
      } else {
        setErrorMessage('Could not initialize microphone recording.');
      }
      cleanupRecording();
    }
  };

  const stopAndSend = () => {
    if (!mediaRecorderRef.current || !isRecording) return;

    const finalDuration = recordingSeconds || 1;
    const recorder = mediaRecorderRef.current;

    recorder.onstop = () => {
      const audioBlob = new Blob(audioChunksRef.current, {
        type: recorder.mimeType || 'audio/webm',
      });

      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }

      setIsRecording(false);
      setRecordingSeconds(0);

      if (audioBlob.size > 0) {
        onSendVoice(audioBlob, finalDuration);
      }
    };

    recorder.stop();
  };

  const cancelRecording = () => {
    cleanupRecording();
    setRecordingSeconds(0);
  };

  const formatSeconds = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  if (!isRecording) {
    return (
      <div className="relative">
        <button
          type="button"
          onClick={startRecording}
          disabled={disabled || !isSupported}
          className="p-2.5 rounded-full text-neutral-500 hover:text-[#087443] hover:bg-emerald-50 dark:hover:bg-emerald-950/40 transition active:scale-95 disabled:opacity-40 disabled:hover:bg-transparent"
          title={isSupported ? 'Record voice message' : 'Voice not supported in this browser'}
          aria-label="Record voice message"
        >
          <Mic className="w-5 h-5" />
        </button>
        {errorMessage && (
          <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-red-600 text-white text-[11px] px-3 py-1.5 rounded-xl shadow-lg whitespace-nowrap z-50 flex items-center gap-1.5 animate-fadeIn">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}
      </div>
    );
  }

  // Active recording bar replacing or overlaying input controls
  return (
    <div className="flex items-center gap-2 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 px-3 py-1.5 rounded-2xl animate-fadeIn">
      {/* Recording Pulsing Dot & Timer */}
      <div className="flex items-center gap-1.5">
        <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
        <span className="text-xs font-mono font-bold text-neutral-800 dark:text-neutral-200">
          {formatSeconds(recordingSeconds)}
        </span>
      </div>

      {/* Animated Soundwave Visualizer */}
      <div className="flex items-center gap-0.5 h-4 px-2">
        <span className="w-1 h-2 bg-[#087443] rounded-full animate-bounce" />
        <span className="w-1 h-4 bg-[#087443] rounded-full animate-pulse delay-75" />
        <span className="w-1 h-3 bg-[#087443] rounded-full animate-bounce delay-150" />
        <span className="w-1 h-5 bg-[#087443] rounded-full animate-pulse delay-100" />
        <span className="w-1 h-2 bg-[#087443] rounded-full animate-bounce delay-200" />
      </div>

      {/* Discard / Cancel Button */}
      <button
        type="button"
        onClick={cancelRecording}
        className="p-1.5 rounded-xl text-neutral-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 transition"
        title="Discard recording"
        aria-label="Discard recording"
      >
        <Trash2 className="w-4 h-4" />
      </button>

      {/* Finish & Send Voice Note */}
      <button
        type="button"
        onClick={stopAndSend}
        className="px-3 py-1 bg-[#087443] hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-sm transition flex items-center gap-1"
        aria-label="Send voice message"
      >
        <Send className="w-3.5 h-3.5" />
        <span className="hidden sm:inline">Send</span>
      </button>
    </div>
  );
};
