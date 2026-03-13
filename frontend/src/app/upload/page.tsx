'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useDropzone } from 'react-dropzone';
import { motion, AnimatePresence } from 'framer-motion';

// Safe Clerk hook
let useClerkUser: any = null;
try { useClerkUser = require('@clerk/nextjs').useUser; } catch {}
function useUser() {
  try { return useClerkUser ? useClerkUser() : { user: null }; } catch { return { user: null }; }
}
import { Upload, FileAudio, X, Loader2, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import Tooltip from '@/components/Tooltip';
import AudioWaveform from '@/components/AudioWaveform';
import { uploadAudio, predictAudio } from '@/lib/api';

export default function UploadPage() {
  const router = useRouter();
  const { user } = useUser();
  const [file, setFile] = useState<File | null>(null);
  const [fileUrl, setFileUrl] = useState<string>('');
  const [uploading, setUploading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const f = acceptedFiles[0];
    if (f) {
      setFile(f);
      setFileUrl(URL.createObjectURL(f));
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'audio/*': ['.wav', '.mp3', '.m4a', '.flac', '.ogg', '.aac'],
    },
    maxFiles: 1,
    maxSize: 50 * 1024 * 1024,
    onDropRejected: (rejections) => {
      const msg = rejections[0]?.errors[0]?.message || 'Invalid file';
      toast.error(msg);
    },
  });

  const removeFile = () => {
    setFile(null);
    if (fileUrl) URL.revokeObjectURL(fileUrl);
    setFileUrl('');
  };

  const handleAnalyze = async () => {
    if (!file) return;

    try {
      setUploading(true);
      toast.loading('Uploading audio...', { id: 'upload' });
      const uploadRes = await uploadAudio(file, user?.id);
      toast.success('Audio uploaded!', { id: 'upload' });

      setUploading(false);
      setAnalyzing(true);
      toast.loading('Analyzing audio with AI...', { id: 'analyze' });
      const result = await predictAudio(uploadRes.audio_path, user?.id);
      toast.success('Analysis complete!', { id: 'analyze' });

      // Store result in sessionStorage and navigate
      sessionStorage.setItem('lastResult', JSON.stringify(result));
      router.push('/result');
    } catch (error: any) {
      toast.error(error?.response?.data?.detail || 'Analysis failed', { id: 'upload' });
      toast.dismiss('analyze');
      setUploading(false);
      setAnalyzing(false);
    }
  };

  return (
    <div className="page-container">
      <div className="content-container max-w-3xl space-y-8">
        <div>
          <h1 className="section-title">Upload Audio</h1>
          <p className="section-subtitle">
            Upload an audio file to analyze if it is real or spoofed.
          </p>
        </div>

        {/* Dropzone */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div
            {...getRootProps()}
            className={`glass-card border-2 border-dashed p-12 text-center cursor-pointer transition-all duration-300 ${
              isDragActive
                ? 'border-primary-500 bg-primary-50/50 dark:bg-primary-950/20'
                : 'border-surface-300 dark:border-surface-700 hover:border-primary-400 dark:hover:border-primary-600'
            }`}
          >
            <input {...getInputProps()} />
            <Upload
              className={`w-12 h-12 mx-auto mb-4 transition-colors ${
                isDragActive ? 'text-primary-500' : 'text-surface-400'
              }`}
            />
            <p className="text-lg font-medium text-surface-700 dark:text-surface-300 mb-2">
              {isDragActive ? 'Drop your audio file here' : 'Drag & drop an audio file'}
            </p>
            <p className="text-sm text-surface-500 dark:text-surface-400">
              or click to browse — WAV, MP3, M4A, FLAC, OGG, AAC (max 50MB)
            </p>
          </div>
        </motion.div>

        {/* Selected File */}
        <AnimatePresence>
          {file && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-4"
            >
              {/* File info */}
              <div className="glass-card p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <FileAudio className="w-8 h-8 text-primary-500" />
                  <div>
                    <p className="font-medium text-surface-900 dark:text-white">{file.name}</p>
                    <p className="text-sm text-surface-500 dark:text-surface-400">
                      {(file.size / (1024 * 1024)).toFixed(2)} MB
                    </p>
                  </div>
                </div>
                <Tooltip text="Remove this file">
                  <button
                    onClick={removeFile}
                    className="p-2 text-surface-400 hover:text-danger-500 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </Tooltip>
              </div>

              {/* Waveform */}
              {fileUrl && <AudioWaveform audioUrl={fileUrl} />}

              {/* Analyze Button */}
              <Tooltip text="Start AI-powered voice spoofing analysis">
                <button
                  onClick={handleAnalyze}
                  disabled={uploading || analyzing}
                  className="btn-primary w-full flex items-center justify-center gap-2 text-lg !py-4 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {uploading || analyzing ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      {uploading ? 'Uploading...' : 'Analyzing with AI...'}
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
        </AnimatePresence>
      </div>
    </div>
  );
}
