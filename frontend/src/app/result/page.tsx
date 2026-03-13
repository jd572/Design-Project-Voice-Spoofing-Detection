'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft, Upload, Mic } from 'lucide-react';
import Link from 'next/link';
import ResultCard from '@/components/ResultCard';
import Tooltip from '@/components/Tooltip';
import type { PredictionResult } from '@/lib/api';

export default function ResultPage() {
  const router = useRouter();
  const [result, setResult] = useState<PredictionResult | null>(null);

  useEffect(() => {
    const stored = sessionStorage.getItem('lastResult');
    if (stored) {
      setResult(JSON.parse(stored));
    }
  }, []);

  if (!result) {
    return (
      <div className="page-container">
        <div className="content-container max-w-3xl text-center py-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card p-12 space-y-6"
          >
            <p className="text-xl font-semibold text-surface-700 dark:text-surface-300">
              No Analysis Result
            </p>
            <p className="text-surface-500 dark:text-surface-400">
              Upload or record audio first to see detection results.
            </p>
            <div className="flex items-center justify-center gap-4">
              <Tooltip text="Upload an audio file to analyze if it is real or spoofed.">
                <Link href="/upload" className="btn-primary flex items-center gap-2">
                  <Upload className="w-4 h-4" /> Upload Audio
                </Link>
              </Tooltip>
              <Tooltip text="Record audio using your microphone for spoof detection.">
                <Link href="/record" className="btn-secondary flex items-center gap-2">
                  <Mic className="w-4 h-4" /> Record Audio
                </Link>
              </Tooltip>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="content-container max-w-4xl space-y-6">
        {/* Back button */}
        <Tooltip text="Go back to dashboard">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 text-sm text-surface-500 dark:text-surface-400 hover:text-primary-500 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Dashboard
          </Link>
        </Tooltip>

        <div>
          <h1 className="section-title">Detection Result</h1>
          <p className="section-subtitle">
            AI analysis of your audio file
          </p>
        </div>

        <ResultCard result={result} />

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Tooltip text="Upload another audio file for analysis">
            <Link href="/upload" className="btn-primary flex items-center justify-center gap-2 flex-1">
              <Upload className="w-4 h-4" /> Analyze Another File
            </Link>
          </Tooltip>
          <Tooltip text="Record new audio for analysis">
            <Link href="/record" className="btn-secondary flex items-center justify-center gap-2 flex-1">
              <Mic className="w-4 h-4" /> Record New Audio
            </Link>
          </Tooltip>
        </div>
      </div>
    </div>
  );
}
