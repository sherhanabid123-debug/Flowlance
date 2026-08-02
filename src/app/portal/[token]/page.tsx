'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { CheckCircle2, Circle, Link as LinkIcon, Loader2, AlertCircle, Zap } from 'lucide-react';
import { format } from 'date-fns';
import { StatusBadge } from '@/components/ui/StatusBadge';

const STEPS = [
  { key: 'potential', label: 'Discussion' },
  { key: 'confirmed', label: 'In Progress' },
  { key: 'completed', label: 'Delivered' },
];

interface PortalClient {
  name: string;
  projectName: string;
  status: 'potential' | 'confirmed' | 'completed';
  notes?: string;
  startDate?: string;
  completionDate?: string;
  sampleProvided?: boolean;
  sampleLink?: string;
  nextFollowUp?: string;
  createdAt: string;
}

interface PortalData {
  client: PortalClient;
  workspaceName: string;
}

export default function ClientPortalPage() {
  const { token } = useParams<{ token: string }>();
  const [data, setData] = useState<PortalData | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPortal = async () => {
      try {
        const res = await fetch(`/api/portal/${token}`);
        const json = await res.json();
        if (!res.ok) throw new Error(json.error || 'Failed to load');
        setData(json);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'This link is invalid or has been disabled.');
      } finally {
        setLoading(false);
      }
    };
    if (token) fetchPortal();
  }, [token]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--background)]">
        <Loader2 className="animate-spin text-primary" size={32} />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--background)] p-4">
        <div className="w-full max-w-md glass border border-red-500/20 rounded-3xl p-8 text-center space-y-6">
          <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto">
            <AlertCircle className="text-red-500" size={32} />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-bold tracking-tight">Link unavailable</h1>
            <p className="text-[var(--text-muted)] text-sm">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  const { client, workspaceName } = data;
  const currentStepIndex = STEPS.findIndex(s => s.key === client.status);

  return (
    <div className="min-h-screen bg-[var(--background)] p-4 sm:p-8 flex items-start sm:items-center justify-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-lg glass border rounded-3xl p-6 sm:p-10 space-y-8"
      >
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[var(--text-muted)]">
          <Zap size={14} className="text-primary" />
          {workspaceName}
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">{client.projectName}</h1>
            <StatusBadge status={client.status} />
          </div>
          <p className="text-sm opacity-60">Prepared for {client.name}</p>
        </div>

        {/* Status stepper */}
        <div className="flex items-center justify-between">
          {STEPS.map((step, idx) => {
            const isCurrent = idx === currentStepIndex;
            return (
              <div key={step.key} className="flex-1 flex flex-col items-center relative">
                {idx > 0 && (
                  <div
                    className={`absolute top-4 right-1/2 w-full h-0.5 -z-10 ${
                      idx <= currentStepIndex ? 'bg-primary' : 'bg-[var(--border)]'
                    }`}
                  />
                )}
                {idx <= currentStepIndex ? (
                  <CheckCircle2 className="text-primary bg-[var(--background)]" size={28} />
                ) : (
                  <Circle className="text-[var(--border)] bg-[var(--background)]" size={28} />
                )}
                <span className={`mt-2 text-[10px] font-bold uppercase tracking-wide text-center ${isCurrent ? 'text-primary' : 'opacity-50'}`}>
                  {step.label}
                </span>
              </div>
            );
          })}
        </div>

        {(client.startDate || client.completionDate) && (
          <div className="flex flex-wrap gap-4 text-xs opacity-70">
            {client.startDate && <p>Started: <span className="font-semibold">{format(new Date(client.startDate), 'dd MMM yyyy')}</span></p>}
            {client.completionDate && <p>Delivered: <span className="font-semibold">{format(new Date(client.completionDate), 'dd MMM yyyy')}</span></p>}
          </div>
        )}

        {client.notes && (
          <div className="bg-black/5 dark:bg-white/5 rounded-2xl p-4">
            <p className="text-[10px] font-bold uppercase tracking-widest opacity-40 mb-1">Latest update</p>
            <p className="text-sm whitespace-pre-wrap">{client.notes}</p>
          </div>
        )}

        {client.sampleProvided && client.sampleLink && (
          <a
            href={client.sampleLink}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 text-sm font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors bg-blue-500/10 hover:bg-blue-500/20 px-4 py-3 rounded-2xl"
          >
            <LinkIcon size={16} /> {client.status === 'completed' ? 'View Final Delivery' : 'View Latest Sample'}
          </a>
        )}

        <p className="text-[10px] opacity-30 text-center pt-2">Shared read-only via {workspaceName} on Flowlance</p>
      </motion.div>
    </div>
  );
}
