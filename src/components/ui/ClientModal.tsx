'use client';

import React, { useState, useEffect, useRef, forwardRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Link as LinkIcon, Info } from 'lucide-react';
import { useClientStore } from '@/store/useClientStore';
import { useToastStore } from '@/store/useToastStore';

interface ClientModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: any;
}

const inputStagger = {
  hidden: { opacity: 0, y: 10 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.05, duration: 0.3 }
  })
};

const InputField = forwardRef<HTMLInputElement, any>(({ label, value, onChange, type="text", required=false, index=0 }, ref) => (
  <motion.div custom={index} variants={inputStagger} initial="hidden" animate="visible" className="relative mb-5 w-full">
    <input
      ref={ref}
      type={type}
      value={value}
      onChange={onChange}
      required={required}
      className="peer w-full bg-transparent p-3 pt-6 rounded-xl border border-[var(--border)] outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-sm"
      placeholder=" "
    />
    <label className={`absolute left-3 top-4 text-xs font-medium opacity-60 transition-all pointer-events-none 
        peer-placeholder-shown:text-sm peer-placeholder-shown:top-3 
        peer-focus:top-1 peer-focus:text-xs peer-focus:text-primary peer-focus:opacity-100
        ${value ? 'top-1 text-xs opacity-100' : ''}`}
    >
      {label} {required && <span className="text-destructive">*</span>}
    </label>
  </motion.div>
));

InputField.displayName = 'InputField';

export function ClientModal({ isOpen, onClose, initialData }: ClientModalProps) {
  const { addClient, updateClient } = useClientStore();
  const { addToast } = useToastStore();

  const [name, setName] = useState('');
  const [contact, setContact] = useState('');
  const [projectName, setProjectName] = useState('');
  const [type, setType] = useState('potential');
  
  // Potential
  const [expectedBudget, setExpectedBudget] = useState('');
  // Confirmed
  const [advanceAmount, setAdvanceAmount] = useState('');
  const [totalAmount, setTotalAmount] = useState('');
  const [startDate, setStartDate] = useState('');
  // Completed
  const [finalAmount, setFinalAmount] = useState('');
  const [completionDate, setCompletionDate] = useState('');
  // General
  const [notes, setNotes] = useState('');
  
  // Sample
  const [sampleProvided, setSampleProvided] = useState(false);
  const [sampleLink, setSampleLink] = useState('');

  useEffect(() => {
    if (initialData) {
      setName(initialData.name || '');
      setContact(initialData.contact || '');
      setProjectName(initialData.projectName || '');
      setType(initialData.status || 'potential');
      setExpectedBudget(initialData.expectedBudget?.toString() || '');
      setAdvanceAmount(initialData.advanceAmount?.toString() || '');
      setTotalAmount(initialData.totalAmount?.toString() || '');
      setStartDate(initialData.startDate ? new Date(initialData.startDate).toISOString().split('T')[0] : '');
      setFinalAmount(initialData.finalAmount?.toString() || '');
      setCompletionDate(initialData.completionDate ? new Date(initialData.completionDate).toISOString().split('T')[0] : '');
      setNotes(initialData.notes || '');
      setSampleProvided(initialData.sampleProvided || false);
      setSampleLink(initialData.sampleLink || '');
    } else {
      // Clear if no initial data
      setName('');
      setContact('');
      setProjectName('');
      setType('potential');
      setExpectedBudget('');
      setAdvanceAmount('');
      setTotalAmount('');
      setStartDate('');
      setFinalAmount('');
      setCompletionDate('');
      setNotes('');
      setSampleProvided(false);
      setSampleLink('');
    }
  }, [initialData, isOpen]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [shake, setShake] = useState(false);
  
  const focusRef = useRef<HTMLInputElement>(null);
  
  // Derived validation
  const isBasicValid = name.trim() !== '' && projectName.trim() !== '';
  const isPotentialValid = isBasicValid; // optional budget
  const isConfirmedValid = isBasicValid && advanceAmount && totalAmount;
  const isCompletedValid = isBasicValid && finalAmount;
  
  const isSampleValid = !sampleProvided || (sampleLink.trim() !== '' && /^https?:\/\//i.test(sampleLink));
  
  const isValid = 
    (type === 'potential' ? isPotentialValid :
    type === 'confirmed' ? isConfirmedValid :
    isCompletedValid) && isSampleValid;

  // Handle ESC and Autfocus
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.addEventListener('keydown', handleEsc);
      setTimeout(() => focusRef.current?.focus(), 100);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => {
      document.removeEventListener('keydown', handleEsc);
    };
  }, [isOpen, onClose]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) {
      setShake(true);
      setTimeout(() => setShake(false), 500);
      return;
    }
    
    setIsSubmitting(true);
    
    const payload = {
      name, contact, projectName, status: type, notes,
      sampleProvided,
      sampleLink: sampleProvided ? sampleLink : '',
      ...(type === 'potential' && { expectedBudget: Number(expectedBudget) }),
      ...(type === 'confirmed' && { advanceAmount: Number(advanceAmount), totalAmount: Number(totalAmount), startDate }),
      ...(type === 'completed' && { finalAmount: Number(finalAmount), totalAmount: Number(totalAmount), completionDate }),
    };

    try {
      const url = initialData ? `/api/clients/${initialData._id}` : '/api/clients';
      const method = initialData ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error('Failed to save client');
      
      const { client } = await res.json();
      if (initialData) {
        updateClient(client);
        addToast('Client updated successfully!', 'success');
      } else {
        addClient(client);
        addToast('Client successfully added!', 'success');
      }
      
      handleClose();
    } catch (error) {
      addToast('Error saving client. Please try again.', 'error');
      setShake(true);
      setTimeout(() => setShake(false), 500);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    // Reset Form
    setName('');
    setContact('');
    setProjectName('');
    setType('potential');
    setExpectedBudget('');
    setAdvanceAmount('');
    setTotalAmount('');
    setStartDate('');
    setFinalAmount('');
    setCompletionDate('');
    setNotes('');
    setSampleProvided(false);
    setSampleLink('');
    onClose();
  };

  const shakeVariants = {
    shake: { x: [0, -10, 10, -10, 10, 0], transition: { duration: 0.4 } }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-hidden">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
          />

          {/* Modal Content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={shake ? "shake" : { opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            variants={shakeVariants}
            className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto glass bg-card text-card-foreground rounded-2xl shadow-2xl p-6 md:p-8 flex flex-col no-scrollbar"
          >
            <button 
              onClick={handleClose}
              className="absolute top-6 right-6 p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
            >
              <X size={20} />
            </button>

            <h2 className="text-2xl font-bold mb-6 tracking-tight">
              {initialData ? 'Edit Client' : 'Add New Client'}
            </h2>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InputField ref={focusRef} index={1} label="Client Name" value={name} onChange={(e:any) => setName(e.target.value)} required />
                <InputField index={2} label="Contact Info (Email/Phone)" value={contact} onChange={(e:any) => setContact(e.target.value)} />
                <div className="md:col-span-2">
                  <InputField index={3} label="Project Name" value={projectName} onChange={(e:any) => setProjectName(e.target.value)} required />
                </div>
              </div>

              {/* Client Type Toggle */}
              <motion.div custom={4} variants={inputStagger} initial="hidden" animate="visible" className="flex flex-col mb-4">
                <label className="text-sm font-medium opacity-70 mb-2">Client Type</label>
                <div className="flex bg-black/5 dark:bg-white/5 p-1 rounded-xl">
                  {['potential', 'confirmed', 'completed'].map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setType(t)}
                      className={`flex-1 py-2 px-3 text-sm font-medium rounded-lg capitalize transition-all ${
                        type === t ? 'bg-background shadow-sm text-primary' : 'hover:opacity-80'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </motion.div>

              {/* Dynamic Fields */}
              <AnimatePresence mode="popLayout">
                {type === 'potential' && (
                  <motion.div key="potential" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="flex gap-4 flex-col md:flex-row w-full">
                    <InputField index={5} label="Expected Budget (₹)" type="number" value={expectedBudget} onChange={(e:any) => setExpectedBudget(e.target.value)} />
                  </motion.div>
                )}
                {type === 'confirmed' && (
                  <motion.div key="confirmed" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                    <InputField index={5} label="Total Amount (₹)" type="number" value={totalAmount} onChange={(e:any) => setTotalAmount(e.target.value)} required />
                    <InputField index={6} label="Advance Amount (₹)" type="number" value={advanceAmount} onChange={(e:any) => setAdvanceAmount(e.target.value)} required />
                    <InputField index={7} label="Start Date" type="date" value={startDate} onChange={(e:any) => setStartDate(e.target.value)} />
                  </motion.div>
                )}
                {type === 'completed' && (
                  <motion.div key="completed" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                    <InputField index={5} label="Final Amount Received (₹)" type="number" value={finalAmount} onChange={(e:any) => setFinalAmount(e.target.value)} required />
                    <InputField index={6} label="Completion Date" type="date" value={completionDate} onChange={(e:any) => setCompletionDate(e.target.value)} />
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Sample Provided Toggle */}
              <motion.div custom={7} variants={inputStagger} initial="hidden" animate="visible" className="flex items-center justify-between bg-black/5 dark:bg-white/5 p-4 rounded-xl mt-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">Sample Provided</span>
                  <div className="group relative flex items-center justify-center cursor-help opacity-50 hover:opacity-100 transition-opacity">
                    <Info size={14} />
                    <span className="absolute bottom-full mb-2 -left-3 hidden group-hover:block w-36 px-2 py-1.5 text-xs bg-black dark:bg-white text-white dark:text-black rounded-lg text-center z-10 shadow-lg pointer-events-none">
                      Sample shared with client
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setSampleProvided(!sampleProvided)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background ${sampleProvided ? 'bg-primary' : 'bg-black/20 dark:bg-white/20'}`}
                >
                  <motion.span
                    layout
                    transition={{ type: "spring", stiffness: 700, damping: 30 }}
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${sampleProvided ? 'translate-x-6' : 'translate-x-1'}`}
                  />
                </button>
              </motion.div>

              <AnimatePresence mode="wait">
                {sampleProvided && (
                  <motion.div
                    key="sample-link"
                    initial={{ opacity: 0, height: 0, marginTop: 0 }}
                    animate={{ opacity: 1, height: 'auto', marginTop: 16 }}
                    exit={{ opacity: 0, height: 0, marginTop: 0 }}
                    className="overflow-hidden"
                  >
                    <InputField 
                      index={8} 
                      label="Sample Link (https://...)" 
                      type="url" 
                      value={sampleLink} 
                      onChange={(e:any) => setSampleLink(e.target.value)} 
                      required 
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Notes */}
              <motion.div custom={9} variants={inputStagger} initial="hidden" animate="visible" className="relative w-full mt-2">
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="peer w-full bg-transparent p-3 pt-6 rounded-xl border border-[var(--border)] outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-sm min-h-[100px] resize-none"
                  placeholder=" "
                />
                <label className={`absolute left-3 top-4 text-xs font-medium opacity-60 transition-all pointer-events-none 
                  peer-placeholder-shown:text-sm peer-placeholder-shown:top-3 
                  peer-focus:top-1 peer-focus:text-xs peer-focus:text-primary peer-focus:opacity-100
                  ${notes ? 'top-1 text-xs opacity-100' : ''}`}
                >
                  Additional Notes
                </label>
              </motion.div>

              {/* Actions */}
              <motion.div custom={10} variants={inputStagger} initial="hidden" animate="visible" className="flex justify-end gap-3 mt-4 pt-4 border-t border-[var(--border)]">
                <button
                  type="button"
                  onClick={handleClose}
                  className="px-5 py-2.5 rounded-xl font-medium border border-[var(--border)] hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !isValid}
                  className="px-5 py-2.5 rounded-xl font-semibold bg-primary text-primary-foreground hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                      Saving...
                    </>
                  ) : 'Save Client'}
                </button>
              </motion.div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
