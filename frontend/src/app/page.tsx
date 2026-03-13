'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Shield,
  Upload,
  Mic,
  Brain,
  Zap,
  Lock,
  ArrowRight,
  Waves,
  Activity,
} from 'lucide-react';
import Tooltip from '@/components/Tooltip';

const features = [
  {
    icon: Upload,
    title: 'Upload Audio',
    description: 'Support for WAV, MP3, M4A, FLAC, OGG, AAC formats with automatic conversion.',
    color: 'from-blue-500 to-indigo-500',
  },
  {
    icon: Mic,
    title: 'Live Recording',
    description: 'Record directly from your browser microphone using WebRTC technology.',
    color: 'from-purple-500 to-pink-500',
  },
  {
    icon: Brain,
    title: 'Deep Learning',
    description: 'CNN-LSTM model trained on ASVspoof dataset for accurate spoofing detection.',
    color: 'from-emerald-500 to-teal-500',
  },
  {
    icon: Activity,
    title: 'Feature Analysis',
    description: 'Extracts MFCC, spectral features, and mel spectrograms for comprehensive analysis.',
    color: 'from-orange-500 to-red-500',
  },
  {
    icon: Zap,
    title: 'Real-time Results',
    description: 'Get instant predictions with confidence scores and detailed explanations.',
    color: 'from-yellow-500 to-amber-500',
  },
  {
    icon: Lock,
    title: 'Secure & Private',
    description: 'Authentication with Clerk. Your data is encrypted and securely stored.',
    color: 'from-cyan-500 to-blue-500',
  },
];

export default function LandingPage() {
  return (
    <div className="page-container">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 dot-pattern opacity-50" />
        <div className="absolute inset-0 bg-gradient-to-b from-primary-500/5 via-transparent to-transparent" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
          <div className="text-center space-y-8">
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-50 dark:bg-primary-950/50 border border-primary-200 dark:border-primary-800/50 text-sm font-medium text-primary-700 dark:text-primary-300"
            >
              <Waves className="w-4 h-4" />
              Powered by ASVspoof Dataset & Deep Learning
            </motion.div>

            {/* Title */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight"
            >
              <span className="text-surface-900 dark:text-white">Detect </span>
              <span className="gradient-text">Voice Spoofing</span>
              <br />
              <span className="text-surface-900 dark:text-white">with AI Precision</span>
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-xl text-surface-600 dark:text-surface-400 max-w-3xl mx-auto leading-relaxed"
            >
              Protect against deepfake voices and synthetic speech attacks.
              Our CNN-LSTM model analyzes audio features to determine if a voice is
              <span className="text-accent-600 dark:text-accent-400 font-semibold"> genuine </span>
              or
              <span className="text-danger-500 font-semibold"> spoofed</span>.
            </motion.p>

            {/* CTA */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4"
            >
              <Tooltip text="Go to your dashboard to start analyzing audio">
                <Link href="/dashboard" className="btn-primary text-lg !px-8 !py-4 flex items-center gap-2">
                  Get Started
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </Tooltip>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <motion.h2
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-3xl sm:text-4xl font-bold text-surface-900 dark:text-white mb-4"
          >
            Powerful Voice Analysis
          </motion.h2>
          <p className="text-lg text-surface-600 dark:text-surface-400 max-w-2xl mx-auto">
            State-of-the-art deep learning technology to detect synthetic and spoofed voices
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              className="glass-card-hover p-6 group"
            >
              <div
                className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300`}
              >
                <feature.icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-bold text-surface-900 dark:text-white mb-2">
                {feature.title}
              </h3>
              <p className="text-surface-600 dark:text-surface-400 text-sm leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-surface-100 dark:bg-surface-800/30 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-surface-900 dark:text-white mb-4">
              How It Works
            </h2>
            <p className="text-lg text-surface-600 dark:text-surface-400">
              Three simple steps to detect voice spoofing
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: '01',
                title: 'Upload or Record',
                desc: 'Upload any audio file or record directly from your microphone.',
              },
              {
                step: '02',
                title: 'AI Analysis',
                desc: 'Our CNN-LSTM model extracts features and analyzes the audio patterns.',
              },
              {
                step: '03',
                title: 'Get Results',
                desc: 'Receive instant prediction with confidence score and detailed explanation.',
              },
            ].map((item, i) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className="text-center"
              >
                <div className="text-6xl font-black gradient-text mb-4">{item.step}</div>
                <h3 className="text-xl font-bold text-surface-900 dark:text-white mb-2">
                  {item.title}
                </h3>
                <p className="text-surface-600 dark:text-surface-400">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-surface-200 dark:border-surface-800">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Shield className="w-5 h-5 text-primary-500" />
            <span className="font-bold gradient-text">VoiceGuard AI</span>
          </div>
          <p className="text-sm text-surface-500 dark:text-surface-400">
            © 2026 VoiceGuard AI. Powered by deep learning and the ASVspoof dataset.
          </p>
        </div>
      </footer>
    </div>
  );
}
