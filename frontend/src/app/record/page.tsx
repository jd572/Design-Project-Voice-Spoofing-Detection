'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

// Safe Clerk hook
let useClerkUser: any = null;
try { useClerkUser = require('@clerk/nextjs').useUser; } catch {}
function useUser() {
  try { return useClerkUser ? useClerkUser() : { user: null }; } catch { return { user: null }; }
}
import { Mic, Square, Loader2, AlertCircle, Clock } from 'lucide-react';
import toast from 'react-hot-toast';
import Tooltip from '@/components/Tooltip';
import AudioWaveform from '@/components/AudioWaveform';
import { uploadRecording, predictAudio } from '@/lib/api';

export default function RecordPage() {
  const router = useRouter();
  const { user } = useUser();
  const [recording, setRecording] = useState(false);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [duration, setDuration] = useState(0);
  const [analyzing, setAnalyzing] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animFrameRef = useRef<number | null>(null);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
          ? 'audio/webm;codecs=opus'
          : 'audio/webm',
      });

      // Audio visualization
      const audioCtx = new AudioContext();
      const source = audioCtx.createMediaStreamSource(stream);
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);
      analyserRef.current = analyser;

      chunksRef.current = [];
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        setRecordedBlob(blob);
        stream.getTracks().forEach((t) => t.stop());
        audioCtx.close();
      };

      mediaRecorder.start(100);
      setRecording(true);
      setDuration(0);
      setRecordedBlob(null);

      // Timer
      timerRef.current = setInterval(() => {
        setDuration((d) => d + 1);
      }, 1000);

      // Visualize
      drawWaveform();

      toast.success('Recording started');
    } catch (err) {
      toast.error('Microphone access denied. Please allow microphone access.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && recording) {
      mediaRecorderRef.current.stop();
      setRecording(false);
      if (timerRef.current) clearInterval(timerRef.current);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      toast.success('Recording stopped');
    }
  };

  const drawWaveform = () => {
    const canvas = canvasRef.current;
    const analyser = analyserRef.current;
    if (!canvas || !analyser) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const draw = () => {
      animFrameRef.current = requestAnimationFrame(draw);
      analyser.getByteTimeDomainData(dataArray);

      ctx.fillStyle = 'rgba(15, 23, 42, 0.3)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.lineWidth = 2;
      ctx.strokeStyle = '#6366f1';
      ctx.beginPath();

      const sliceWidth = canvas.width / bufferLength;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        const v = dataArray[i] / 128.0;
        const y = (v * canvas.height) / 2;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
        x += sliceWidth;
      }

      ctx.lineTo(canvas.width, canvas.height / 2);
      ctx.stroke();
    };

    draw();
  };

  const formatDuration = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleAnalyze = async () => {
    if (!recordedBlob) return;

    try {
      setAnalyzing(true);
      toast.loading('Uploading recording...', { id: 'rec-upload' });
      const uploadRes = await uploadRecording(recordedBlob, user?.id);
      toast.success('Recording uploaded!', { id: 'rec-upload' });

      toast.loading('Analyzing audio with AI...', { id: 'rec-analyze' });
      const result = await predictAudio(uploadRes.audio_path, user?.id);
      toast.success('Analysis complete!', { id: 'rec-analyze' });

      sessionStorage.setItem('lastResult', JSON.stringify(result));
      router.push('/result');
    } catch (error: any) {
      toast.error(error?.response?.data?.detail || 'Analysis failed', { id: 'rec-upload' });
      toast.dismiss('rec-analyze');
      setAnalyzing(false);
    }
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, []);

  return (
    <div className="page-container">
      <div className="content-container max-w-3xl space-y-8">
        <div>
          <h1 className="section-title">Record Audio</h1>
          <p className="section-subtitle">
            Record audio using your microphone for spoof detection.
          </p>
        </div>

        {/* Recorder */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-8 text-center space-y-6"
        >
          {/* Live waveform canvas */}
          {recording && (
            <div className="rounded-xl overflow-hidden bg-surface-900">
              <canvas
                ref={canvasRef}
                width={600}
                height={100}
                className="w-full h-[100px]"
              />
            </div>
          )}

          {/* Timer */}
          <div className="flex items-center justify-center gap-2">
            <Clock className="w-5 h-5 text-surface-500" />
            <span className="text-3xl font-mono font-bold text-surface-900 dark:text-white">
              {formatDuration(duration)}
            </span>
          </div>

          {/* Record button */}
          <div className="flex justify-center">
            {!recording ? (
              <Tooltip text="Start recording audio from your microphone" position="bottom">
                <button
                  onClick={startRecording}
                  className="w-24 h-24 rounded-full gradient-bg flex items-center justify-center shadow-2xl shadow-primary-500/40 hover:scale-105 active:scale-95 transition-transform"
                >
                  <Mic className="w-10 h-10 text-white" />
                </button>
              </Tooltip>
            ) : (
              <Tooltip text="Stop recording" position="bottom">
                <button
                  onClick={stopRecording}
                  className="w-24 h-24 rounded-full bg-danger-500 flex items-center justify-center shadow-2xl shadow-danger-500/40 hover:scale-105 active:scale-95 transition-transform animate-pulse"
                >
                  <Square className="w-10 h-10 text-white" />
                </button>
              </Tooltip>
            )}
          </div>

          <p className="text-sm text-surface-500 dark:text-surface-400">
            {recording
              ? 'Recording... Click the stop button when done.'
              : 'Click the microphone button to start recording.'}
          </p>
        </motion.div>

        {/* Recorded audio preview */}
        {recordedBlob && !recording && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <AudioWaveform audioBlob={recordedBlob} />

            <Tooltip text="Start AI-powered voice spoofing analysis on your recording">
              <button
                onClick={handleAnalyze}
                disabled={analyzing}
                className="btn-primary w-full flex items-center justify-center gap-2 text-lg !py-4 disabled:opacity-50"
              >
                {analyzing ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Analyzing with AI...
                  </>
                ) : (
                  <>
                    <AlertCircle className="w-5 h-5" />
                    Analyze for Spoofing
                  </>
                )}
              </button>
            </Tooltip>
          </motion.div>
        )}
      </div>
    </div>
  );
}
