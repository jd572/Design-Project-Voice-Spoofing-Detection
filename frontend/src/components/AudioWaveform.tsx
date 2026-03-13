'use client';

import { useEffect, useRef, useState } from 'react';
import WaveSurfer from 'wavesurfer.js';
import { Play, Pause, Volume2 } from 'lucide-react';

interface AudioWaveformProps {
  audioUrl?: string;
  audioBlob?: Blob;
  height?: number;
}

export default function AudioWaveform({ audioUrl, audioBlob, height = 80 }: AudioWaveformProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const wavesurferRef = useRef<WaveSurfer | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);

  useEffect(() => {
    if (!containerRef.current) return;

    const ws = WaveSurfer.create({
      container: containerRef.current,
      waveColor: '#818cf8',
      progressColor: '#6366f1',
      cursorColor: '#4f46e5',
      barWidth: 3,
      barRadius: 3,
      barGap: 2,
      height: height,
      normalize: true,
      autoplay: false,
      backend: 'WebAudio',
    });

    wavesurferRef.current = ws;

    ws.on('play', () => setIsPlaying(true));
    ws.on('pause', () => setIsPlaying(false));
    ws.on('ready', () => setDuration(ws.getDuration()));
    ws.on('timeupdate', (time) => setCurrentTime(time));

    if (audioUrl) {
      ws.load(audioUrl).catch((e) => {
        if (e.name !== 'AbortError') console.error('WaveSurfer load error:', e);
      });
    } else if (audioBlob) {
      ws.loadBlob(audioBlob).catch((e) => {
        if (e.name !== 'AbortError') console.error('WaveSurfer load error:', e);
      });
    }

    return () => {
      try {
        ws.destroy();
      } catch (e) {
        // Ignore AbortError if component unmounts while fetching audio
      }
    };
  }, [audioUrl, audioBlob, height]);

  const togglePlay = () => {
    wavesurferRef.current?.playPause();
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="glass-card p-4 space-y-3">
      <div className="flex items-center gap-2 text-sm text-surface-500 dark:text-surface-400">
        <Volume2 className="w-4 h-4" />
        <span>Audio Preview</span>
      </div>

      <div ref={containerRef} className="rounded-lg overflow-hidden" />

      <div className="flex items-center justify-between">
        <button
          onClick={togglePlay}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary-500 hover:bg-primary-600 text-white text-sm font-medium transition-colors"
        >
          {isPlaying ? (
            <>
              <Pause className="w-4 h-4" /> Pause
            </>
          ) : (
            <>
              <Play className="w-4 h-4" /> Play
            </>
          )}
        </button>
        <span className="text-sm text-surface-500 dark:text-surface-400 font-mono">
          {formatTime(currentTime)} / {formatTime(duration)}
        </span>
      </div>
    </div>
  );
}
