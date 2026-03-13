'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Upload,
  Mic,
  History,
  Shield,
  Activity,
  TrendingUp,
  ArrowRight,
} from 'lucide-react';
import Tooltip from '@/components/Tooltip';

// Safe Clerk hook
let useClerkUser: any = null;
try { useClerkUser = require('@clerk/nextjs').useUser; } catch {}
function useUser() {
  try { return useClerkUser ? useClerkUser() : { user: null }; } catch { return { user: null }; }
}

const quickActions = [
  {
    href: '/upload',
    icon: Upload,
    title: 'Upload Audio',
    desc: 'Analyze an audio file',
    tooltip: 'Upload an audio file to analyze if it is real or spoofed.',
    color: 'from-blue-500 to-indigo-500',
  },
  {
    href: '/record',
    icon: Mic,
    title: 'Record Audio',
    desc: 'Use your microphone',
    tooltip: 'Record audio using your microphone for spoof detection.',
    color: 'from-purple-500 to-pink-500',
  },
  {
    href: '/history',
    icon: History,
    title: 'View History',
    desc: 'Past detections',
    tooltip: 'View your previous voice spoofing detection results.',
    color: 'from-emerald-500 to-teal-500',
  },
];

const stats = [
  { label: 'Model Accuracy', value: '95.2%', icon: TrendingUp },
  { label: 'Features Extracted', value: '7+', icon: Activity },
  { label: 'Audio Formats', value: '6', icon: Shield },
];

export default function DashboardPage() {
  const { user } = useUser();

  return (
    <div className="page-container">
      <div className="content-container space-y-8">
        {/* Welcome Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-2"
        >
          <h1 className="text-3xl font-bold text-surface-900 dark:text-white">
            Welcome back, {user?.firstName || 'User'} 👋
          </h1>
          <p className="text-surface-600 dark:text-surface-400">
            Detect voice spoofing attacks with AI-powered analysis.
          </p>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="glass-card p-5 flex items-center gap-4"
            >
              <div className="w-12 h-12 rounded-xl gradient-bg flex items-center justify-center">
                <stat.icon className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold text-surface-900 dark:text-white">{stat.value}</p>
                <p className="text-sm text-surface-500 dark:text-surface-400">{stat.label}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Quick Actions */}
        <div>
          <h2 className="text-xl font-bold text-surface-900 dark:text-white mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {quickActions.map((action, i) => (
              <Tooltip key={action.href} text={action.tooltip} position="bottom">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 + i * 0.1 }}
                  className="w-full"
                >
                  <Link
                    href={action.href}
                    className="glass-card-hover p-6 flex flex-col items-center text-center group block"
                  >
                    <div
                      className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${action.color} flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform`}
                    >
                      <action.icon className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-lg font-bold text-surface-900 dark:text-white mb-1">
                      {action.title}
                    </h3>
                    <p className="text-sm text-surface-500 dark:text-surface-400 mb-3">
                      {action.desc}
                    </p>
                    <span className="text-primary-500 text-sm font-medium flex items-center gap-1 group-hover:gap-2 transition-all">
                      Get Started <ArrowRight className="w-4 h-4" />
                    </span>
                  </Link>
                </motion.div>
              </Tooltip>
            ))}
          </div>
        </div>

        {/* Info Section */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="glass-card p-6"
        >
          <h2 className="text-xl font-bold text-surface-900 dark:text-white mb-3">
            About the Detection Model
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-surface-600 dark:text-surface-400">
            <div className="space-y-2">
              <p><strong className="text-surface-900 dark:text-white">Architecture:</strong> CNN-LSTM hybrid model</p>
              <p><strong className="text-surface-900 dark:text-white">Training Data:</strong> ASVspoof dataset</p>
              <p><strong className="text-surface-900 dark:text-white">Input:</strong> Mel Spectrogram (128×128)</p>
            </div>
            <div className="space-y-2">
              <p><strong className="text-surface-900 dark:text-white">Features:</strong> MFCC, Delta MFCC, ZCR, Spectral Centroid/Roll-off, RMS</p>
              <p><strong className="text-surface-900 dark:text-white">Output:</strong> Real/Spoof classification with confidence</p>
              <p><strong className="text-surface-900 dark:text-white">Explanation:</strong> Feature-based analysis justification</p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
