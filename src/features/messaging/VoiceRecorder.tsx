'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Mic, Trash2, Send, AlertCircle } from 'lucide-react';
import { voiceService } from '@/services/voiceService';

interface VoiceRecorderProps {
  onSendVoice: (audioBlob: Blob, durationSeconds: number) => void;
  disabled?: boolean;
  onRecordingStateChange?: (isRecording: boolean) => void;
}

export const VoiceRecorder: React.FC<VoiceRecorderProps> = ({
  onSendVoice,
  disabled = false,
  onRecordingStateChange,
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

  const updateRecordingState = (recording: boolean) => {
    setIsRecording(recording);
    onRecordingStateChange?.(recording);
  };

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
    updateRecordingState(false);
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

      recorder.start(100);
      updateRecordingState(true);
      setRecordingSeconds(0);

      timerRef.current = setInterval(() => {
        setRecordingSeconds((prev) => {
          if (prev >= 120) {
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

      updateRecordingState(false);
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
      <div className="relative flex-shrink-0">
        <button
          type="button"
          onClick={startRecording}
          disabled={disabled || !isSupported}
          className="w-9 h-9 rounded-xl bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600/30 flex items-center justify-center transition-all disabled:opacity-40 disabled:cursor-not-allowed pointer-events-auto cursor-pointer"
          title={isSupported ? 'Record voice message' : 'Voice not supported in this browser'}
          aria-label="Record voice message"
        >
          <Mic className="h-4 w-4" strokeWidth={1.75} />
        </button>
        {errorMessage && (
          <div className="absolute bottom-full mb-2 right-0 bg-red-600 text-white text-[11px] px-3 py-1.5 rounded-xl shadow-lg whitespace-nowrap z-50 flex items-center gap-1.5 animate-fadeIn">
            <AlertCircle className="h-3.5 w-3.5 shrink-0" strokeWidth={1.75} />
            <span>{errorMessage}</span>
          </div>
        )}
      </div>
    );
  }

  // RECORDING STATE (transform bar, do not animate height):
  // border-red-500/20 bg-red-500/5
  // Left Trash2 cancel; center pulse dot + mono timer + live bars; right Send
  // Pulse via opacity; motion-reduce static
  return (
    <div className="flex-1 flex items-center justify-between gap-2 px-1 py-0.5 pointer-events-auto select-none min-h-[32px]">
      {/* Left Trash2 cancel */}
      <button
        type="button"
        onClick={cancelRecording}
        className="w-8 h-8 rounded-lg flex items-center justify-center text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors pointer-events-auto cursor-pointer"
        title="Cancel recording"
        aria-label="Cancel recording"
      >
        <Trash2 className="h-4 w-4" strokeWidth={1.75} />
      </button>

      {/* Center: pulse dot + mono timer + live bars */}
      <div className="flex items-center gap-3">
        <span
          className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse motion-reduce:animate-none"
          aria-hidden="true"
        />
        <span className="font-mono text-xs font-semibold text-white/80 tabular-nums">
          {formatSeconds(recordingSeconds)}
        </span>

        {/* Live animated waveform bars */}
        <div className="flex items-center gap-0.5 h-4 px-1" aria-hidden="true">
          <span className="w-0.5 h-2 bg-red-400 rounded-full animate-pulse motion-reduce:animate-none" />
          <span className="w-0.5 h-3.5 bg-red-400 rounded-full animate-pulse delay-75 motion-reduce:animate-none" />
          <span className="w-0.5 h-1.5 bg-red-400 rounded-full animate-pulse delay-150 motion-reduce:animate-none" />
          <span className="w-0.5 h-4 bg-red-400 rounded-full animate-pulse delay-100 motion-reduce:animate-none" />
          <span className="w-0.5 h-2.5 bg-red-400 rounded-full animate-pulse delay-200 motion-reduce:animate-none" />
          <span className="w-0.5 h-3 bg-red-400 rounded-full animate-pulse delay-300 motion-reduce:animate-none" />
          <span className="w-0.5 h-1.5 bg-red-400 rounded-full animate-pulse delay-75 motion-reduce:animate-none" />
        </div>
      </div>

      {/* Right Send */}
      <button
        type="button"
        onClick={stopAndSend}
        className="w-9 h-9 rounded-xl bg-emerald-600 text-white hover:bg-emerald-500 flex items-center justify-center transition-all active:scale-95 pointer-events-auto cursor-pointer"
        title="Send voice note"
        aria-label="Send voice note"
      >
        <Send className="h-4 w-4" strokeWidth={1.75} />
      </button>
    </div>
  );
};
