'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

// Safe Clerk hook
let useClerkUser: any = null;
try { useClerkUser = require('@clerk/nextjs').useUser; } catch {}
function useUser() {
  try { return useClerkUser ? useClerkUser() : { user: null }; } catch { return { user: null }; }
}
import { History, RefreshCw } from 'lucide-react';
import Tooltip from '@/components/Tooltip';
import HistoryTable from '@/components/HistoryTable';
import { getUserHistory, type HistoryRecord } from '@/lib/api';
import toast from 'react-hot-toast';

export default function HistoryPage() {
  const { user } = useUser();
  const [records, setRecords] = useState<HistoryRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchHistory = async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      const data = await getUserHistory(user.id);
      setRecords(data);
    } catch (error) {
      toast.error('Failed to load history');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.id) {
      fetchHistory();
    }
  }, [user?.id]);

  return (
    <div className="page-container">
      <div className="content-container space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="section-title flex items-center gap-3">
              <History className="w-8 h-8 text-primary-500" />
              Detection History
            </h1>
            <p className="section-subtitle">
              View your past voice spoofing detection results.
            </p>
          </div>

          <Tooltip text="Refresh history data">
            <button
              onClick={fetchHistory}
              disabled={loading}
              className="btn-secondary flex items-center gap-2"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </Tooltip>
        </div>

        {/* Summary stats */}
        {!loading && records.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 sm:grid-cols-3 gap-4"
          >
            <div className="glass-card p-4 text-center">
              <p className="text-3xl font-bold text-surface-900 dark:text-white">
                {records.length}
              </p>
              <p className="text-sm text-surface-500 dark:text-surface-400">Total Analyses</p>
            </div>
            <div className="glass-card p-4 text-center">
              <p className="text-3xl font-bold text-accent-500">
                {records.filter((r) => r.prediction === 'REAL').length}
              </p>
              <p className="text-sm text-surface-500 dark:text-surface-400">Real Detected</p>
            </div>
            <div className="glass-card p-4 text-center">
              <p className="text-3xl font-bold text-danger-500">
                {records.filter((r) => r.prediction === 'SPOOF').length}
              </p>
              <p className="text-sm text-surface-500 dark:text-surface-400">Spoof Detected</p>
            </div>
          </motion.div>
        )}

        <HistoryTable records={records} loading={loading} />
      </div>
    </div>
  );
}
