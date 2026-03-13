'use client';

import { motion } from 'framer-motion';
import ConfidenceMeter from './ConfidenceMeter';
import { Shield, ShieldAlert, FileAudio, Info } from 'lucide-react';
import type { PredictionResult } from '@/lib/api';

interface ResultCardProps {
  result: PredictionResult;
}

export default function ResultCard({ result }: ResultCardProps) {
  const isReal = result.prediction === 'REAL';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className={`glass-card overflow-hidden ${
        isReal ? 'border-accent-500/30' : 'border-danger-500/30'
      }`}
    >
      {/* Header Bar */}
      <div
        className={`px-6 py-4 flex items-center gap-3 ${
          isReal
            ? 'bg-gradient-to-r from-accent-500/10 to-accent-600/5'
            : 'bg-gradient-to-r from-danger-500/10 to-danger-600/5'
        }`}
      >
        {isReal ? (
          <Shield className="w-6 h-6 text-accent-500" />
        ) : (
          <ShieldAlert className="w-6 h-6 text-danger-500" />
        )}
        <h3 className="text-lg font-bold text-surface-900 dark:text-white">
          Detection Result
        </h3>
        <div className="ml-auto flex items-center gap-2 text-sm text-surface-500 dark:text-surface-400">
          <FileAudio className="w-4 h-4" />
          {result.audio_filename}
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Confidence Meter + Prediction */}
        <div className="flex flex-col sm:flex-row items-center gap-8">
          <ConfidenceMeter
            confidence={result.confidence}
            prediction={result.prediction}
          />

          <div className="flex-1 space-y-4">
            {/* Feature Grid */}
            <h4 className="text-sm font-semibold text-surface-500 dark:text-surface-400 uppercase tracking-wider">
              Extracted Features
            </h4>
            <div className="grid grid-cols-2 gap-3">
              <FeatureItem label="Zero Crossing Rate" value={result.features.zero_crossing_rate.toFixed(4)} />
              <FeatureItem label="Spectral Centroid" value={`${result.features.spectral_centroid.toFixed(0)} Hz`} />
              <FeatureItem label="Spectral Roll-off" value={`${result.features.spectral_rolloff.toFixed(0)} Hz`} />
              <FeatureItem label="RMS Energy" value={result.features.rms_energy.toFixed(5)} />
              <FeatureItem label="MFCC Coefficients" value={`${result.features.mfcc_mean.length} extracted`} />
              <FeatureItem label="Delta MFCC" value={`${result.features.delta_mfcc_mean.length} extracted`} />
            </div>
          </div>
        </div>

        {/* Explanation */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className={`p-4 rounded-xl border ${
            isReal
              ? 'bg-accent-50/50 dark:bg-accent-950/20 border-accent-200 dark:border-accent-800/30'
              : 'bg-red-50/50 dark:bg-red-950/20 border-red-200 dark:border-red-800/30'
          }`}
        >
          <div className="flex items-start gap-2">
            <Info className={`w-5 h-5 mt-0.5 flex-shrink-0 ${isReal ? 'text-accent-600 dark:text-accent-400' : 'text-red-600 dark:text-red-400'}`} />
            <div>
              <h4 className="font-semibold text-surface-900 dark:text-white mb-1">
                Analysis Explanation
              </h4>
              <p className="text-sm text-surface-600 dark:text-surface-300 leading-relaxed whitespace-pre-wrap">
                {result.explanation}
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}

function FeatureItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-surface-50 dark:bg-surface-800/50 rounded-lg px-3 py-2">
      <p className="text-xs text-surface-500 dark:text-surface-400">{label}</p>
      <p className="text-sm font-semibold text-surface-900 dark:text-white font-mono">
        {value}
      </p>
    </div>
  );
}
