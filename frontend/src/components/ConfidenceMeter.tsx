'use client';

import { motion } from 'framer-motion';

interface ConfidenceMeterProps {
  confidence: number;
  prediction: 'REAL' | 'SPOOF';
  size?: number;
}

export default function ConfidenceMeter({
  confidence,
  prediction,
  size = 160,
}: ConfidenceMeterProps) {
  const isReal = prediction === 'REAL';
  const color = isReal ? '#10b981' : '#ef4444';
  const bgColor = isReal ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)';
  const glowClass = isReal ? 'glow-green' : 'glow-red';

  const radius = (size - 16) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (confidence / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-3">
      <div className={`relative ${glowClass} rounded-full`}>
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          className="transform -rotate-90"
        >
          {/* Background circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill={bgColor}
            stroke="currentColor"
            strokeWidth={8}
            className="text-surface-200 dark:text-surface-700"
          />
          {/* Progress circle */}
          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={8}
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 1.5, ease: 'easeOut' }}
          />
        </svg>
        {/* Center text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.span
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            className="text-3xl font-bold"
            style={{ color }}
          >
            {confidence}%
          </motion.span>
          <span className="text-xs text-surface-500 dark:text-surface-400 font-medium">
            Confidence
          </span>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className={`px-4 py-1.5 rounded-full text-sm font-bold ${
          isReal
            ? 'bg-accent-100 dark:bg-accent-900/30 text-accent-700 dark:text-accent-400'
            : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
        }`}
      >
        {prediction}
      </motion.div>
    </div>
  );
}
