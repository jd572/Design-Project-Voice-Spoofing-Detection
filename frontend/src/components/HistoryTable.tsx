'use client';

import { motion } from 'framer-motion';
import { Shield, ShieldAlert, Calendar, FileAudio } from 'lucide-react';
import type { HistoryRecord } from '@/lib/api';

interface HistoryTableProps {
  records: HistoryRecord[];
  loading?: boolean;
}

export default function HistoryTable({ records, loading = false }: HistoryTableProps) {
  if (loading) {
    return (
      <div className="glass-card overflow-hidden">
        <div className="p-6 space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 bg-surface-100 dark:bg-surface-800 rounded-xl shimmer" />
          ))}
        </div>
      </div>
    );
  }

  if (records.length === 0) {
    return (
      <div className="glass-card p-12 text-center">
        <FileAudio className="w-12 h-12 text-surface-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-surface-700 dark:text-surface-300">
          No Detection History
        </h3>
        <p className="text-surface-500 dark:text-surface-400 mt-1">
          Upload or record audio to start detecting voice spoofing.
        </p>
      </div>
    );
  }

  return (
    <div className="glass-card overflow-hidden">
      {/* Desktop table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-surface-50 dark:bg-surface-800/50 border-b border-surface-200 dark:border-surface-700">
              <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-surface-500 dark:text-surface-400">
                File
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-surface-500 dark:text-surface-400">
                Result
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-surface-500 dark:text-surface-400">
                Confidence
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-surface-500 dark:text-surface-400">
                Date
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-100 dark:divide-surface-800">
            {records.map((record, index) => (
              <motion.tr
                key={record.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="hover:bg-surface-50 dark:hover:bg-surface-800/30 transition-colors"
              >
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <FileAudio className="w-5 h-5 text-primary-500" />
                    <span className="text-sm font-medium text-surface-900 dark:text-white truncate max-w-[200px]">
                      {record.audio_filename}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <PredictionBadge prediction={record.prediction} />
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <div className="w-24 bg-surface-200 dark:bg-surface-700 rounded-full h-2">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${record.confidence}%` }}
                        transition={{ delay: index * 0.05 + 0.2, duration: 0.8 }}
                        className={`h-2 rounded-full ${
                          record.prediction === 'REAL' ? 'bg-accent-500' : 'bg-danger-500'
                        }`}
                      />
                    </div>
                    <span className="text-sm font-mono text-surface-600 dark:text-surface-400">
                      {record.confidence}%
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2 text-sm text-surface-500 dark:text-surface-400">
                    <Calendar className="w-4 h-4" />
                    {new Date(record.date).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </div>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="md:hidden p-4 space-y-3">
        {records.map((record, index) => (
          <motion.div
            key={record.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="bg-surface-50 dark:bg-surface-800/50 rounded-xl p-4 space-y-2"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileAudio className="w-4 h-4 text-primary-500" />
                <span className="text-sm font-medium text-surface-900 dark:text-white truncate max-w-[180px]">
                  {record.audio_filename}
                </span>
              </div>
              <PredictionBadge prediction={record.prediction} />
            </div>
            <div className="flex items-center justify-between text-xs text-surface-500 dark:text-surface-400">
              <span>Confidence: {record.confidence}%</span>
              <span>{new Date(record.date).toLocaleDateString()}</span>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function PredictionBadge({ prediction }: { prediction: string }) {
  const isReal = prediction === 'REAL';
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
        isReal
          ? 'bg-accent-100 dark:bg-accent-900/30 text-accent-700 dark:text-accent-400'
          : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
      }`}
    >
      {isReal ? <Shield className="w-3 h-3" /> : <ShieldAlert className="w-3 h-3" />}
      {prediction}
    </span>
  );
}
