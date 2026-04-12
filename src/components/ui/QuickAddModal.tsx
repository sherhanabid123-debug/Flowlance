'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, X } from 'lucide-react';
import { useClientStore } from '@/store/useClientStore';
import { useToastStore } from '@/store/useToastStore';
import { CenteredModal } from './CenteredModal';

interface QuickAddModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddDetails: (client: any) => void;
}

export function QuickAddModal({ isOpen, onClose, onAddDetails }: QuickAddModalProps) {
  const [name, setName] = useState('');
  const [projectName, setProjectName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const nameRef = useRef<HTMLInputElement>(null);
  const { addClient } = useClientStore();
  const { addToast } = useToastStore();

  useEffect(() => {
    if (isOpen) {
      setName('');
      setProjectName('');
      setTimeout(() => nameRef.current?.focus(), 100);
    }
  }, [isOpen]);

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!name.trim() || !projectName.trim()) return;

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/clients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          projectName: projectName.trim(),
          status: 'potential',
          followUpInterval: 3,
        }),
      });

      if (!res.ok) throw new Error('Failed to add client');
      const { client } = await res.json();

      // Optimistic add to store
      addClient(client);
      onClose();

      addToast(
        `${client.name} added!`,
        'success',
        {
          label: 'Add Details',
          onClick: () => onAddDetails(client),
        }
      );
    } catch {
      addToast('Failed to add client. Try again.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <CenteredModal isOpen={isOpen} onClose={onClose} title="" maxWidth="max-w-sm">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {/* Header */}
        <div className="flex items-center gap-3 mb-1">
          <div className="p-2 bg-primary/10 text-primary rounded-xl">
            <Zap size={20} />
          </div>
          <div>
            <h2 className="font-bold text-lg leading-tight">Quick Add Client</h2>
            <p className="text-xs opacity-50">Just the essentials — fill details later.</p>
          </div>
        </div>

        {/* Client Name */}
        <div className="relative">
          <input
            ref={nameRef}
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Client name *"
            required
            className="w-full px-4 py-3 rounded-xl border border-[var(--border)] bg-transparent outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-sm font-medium placeholder:opacity-40"
          />
        </div>

        {/* Project Name */}
        <div className="relative">
          <input
            type="text"
            value={projectName}
            onChange={e => setProjectName(e.target.value)}
            placeholder="Project name *"
            required
            onKeyDown={e => e.key === 'Enter' && handleSubmit()}
            className="w-full px-4 py-3 rounded-xl border border-[var(--border)] bg-transparent outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-sm font-medium placeholder:opacity-40"
          />
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={isSubmitting || !name.trim() || !projectName.trim()}
          className="w-full h-12 bg-primary text-white font-bold rounded-xl hover:opacity-90 active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-primary/20"
        >
          {isSubmitting ? (
            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              <Zap size={16} />
              Add Client
            </>
          )}
        </button>

        <p className="text-center text-[10px] opacity-30 -mt-1">Press Enter to submit · Status defaults to Potential</p>
      </form>
    </CenteredModal>
  );
}
