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
      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        {/* Header */}
        <div className="flex items-center gap-3 mb-2">
          <div className="p-3 bg-primary/10 text-primary rounded-[1rem] shadow-sm shadow-primary/5">
            <Zap size={22} />
          </div>
          <div>
            <h2 className="font-bold text-xl leading-tight tracking-tight">Quick Add Client</h2>
            <p className="text-[11px] opacity-50">Just the essentials — fill details later.</p>
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
            className="w-full px-5 py-4 rounded-2xl input-clean outline-none text-sm font-medium placeholder:opacity-30"
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
            className="w-full px-5 py-4 rounded-2xl input-clean outline-none text-sm font-medium placeholder:opacity-30"
          />
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={isSubmitting || !name.trim() || !projectName.trim()}
          className="w-full h-14 bg-primary text-white font-bold rounded-2xl hover:opacity-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-primary/20 btn-lift"
        >
          {isSubmitting ? (
            <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              <Zap size={18} />
              Add Client
            </>
          )}
        </button>

        <p className="text-center text-[10px] opacity-30 -mt-1 uppercase font-bold tracking-[0.1em]">Press Enter to submit · Potential Status</p>
      </form>
    </CenteredModal>
  );
}
