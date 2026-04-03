'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useClientStore } from '@/store/useClientStore';
import { useWorkspaceStore } from '@/store/useWorkspaceStore';
import { useAuthStore } from '@/store/useAuthStore';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Plus, Trash2, Edit, Link as LinkIcon, CheckCheck, MessageCircle, Zap, Download } from 'lucide-react';
import { ClientModal } from '@/components/ui/ClientModal';
import { QuickAddModal } from '@/components/ui/QuickAddModal';
import { FollowUpOutcomeModal } from '@/components/ui/FollowUpOutcomeModal';
import { useToastStore } from '@/store/useToastStore';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { FollowUpBadge } from '@/components/ui/FollowUpBadge';
import { HealthBadge } from '@/components/ui/HealthBadge';
import { getClientHealthStatus } from '@/lib/clientHealth';
import { exportClientsToCSV } from '@/lib/exportUtils';
import { isPast, isToday, format } from 'date-fns';
import { useAuthBarrier } from '@/hooks/useAuthBarrier';

function ClientsContent() {
  const { clients, setClients, isLoading, setLoading, deleteClient, markFollowUpDone } = useClientStore();
  const { workspace, getCurrentRole } = useWorkspaceStore();
  const { user } = useAuthStore();
  
  const searchParams = useSearchParams();
  const [filter, setFilter] = useState(searchParams.get('filter') || 'all');
  const [followUpFilter, setFollowUpFilter] = useState(searchParams.get('followUp') || 'all');
  const [healthFilter, setHealthFilter] = useState(searchParams.get('health') || 'all');
  const [minValue, setMinValue] = useState(Number(searchParams.get('minBudget')) || 0);
  const [hasSample, setHasSample] = useState(searchParams.get('hasSample') === 'true');
  
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<any>(null);
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
  const [isOutcomeModalOpen, setIsOutcomeModalOpen] = useState(false);
  const [activeClient, setActiveClient] = useState<any>(null);
  const { addToast } = useToastStore();
  
  // Sync with URL params if they change
  useEffect(() => {
    const f = searchParams.get('filter');
    const fu = searchParams.get('followUp');
    const h = searchParams.get('health');
    const mv = searchParams.get('minBudget');
    const hs = searchParams.get('hasSample');

    if (f) setFilter(f);
    if (fu) setFollowUpFilter(fu);
    if (h) setHealthFilter(h);
    if (mv) setMinValue(Number(mv));
    if (hs !== null) setHasSample(hs === 'true');
  }, [searchParams]);

  const role = getCurrentRole(user?._id);
  const isOwner = role === 'owner';

  const { runProtected, isAuthenticated } = useAuthBarrier();

  useEffect(() => {
    if (!isAuthenticated) return;

    const fetchClients = async () => {
      try {
        setLoading(true);
        const res = await fetch('/api/clients');
        const data = await res.json();
        setClients(data.clients || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchClients();
  }, [setClients, setLoading, isAuthenticated]);

  const handleDelete = async (id: string) => {
    runProtected(async () => {
      if (!isOwner && isAuthenticated) {
        addToast('Only owners can delete clients', 'error');
        return;
      }
      if (!confirm('Are you sure you want to delete this client?')) return;
      try {
        const res = await fetch(`/api/clients/${id}`, { method: 'DELETE' });
        if (!res.ok) throw new Error('Failed to delete');
        deleteClient(id);
        addToast('Client deleted successfully', 'info');
      } catch (e) {
        addToast('Error deleting client', 'error');
      }
    });
  };

  const handleEdit = (client: any) => {
    runProtected(() => {
      setEditingClient(client);
      setIsModalOpen(true);
    });
  };

  const handleUpgradeStatus = (client: any, newStatus: string) => {
    runProtected(() => {
      if (!isOwner && isAuthenticated) {
        addToast('Only owners can move clients between stages', 'error');
        return;
      }
      setEditingClient({ ...client, status: newStatus });
      setIsModalOpen(true);
    });
  };

  const handleMarkFollowUpDone = async (client: any) => {
    setActiveClient(client);
    setIsOutcomeModalOpen(true);
  };

  const handleOutcomeSubmit = async (data: any) => {
    runProtected(async () => {
      if (!activeClient) return;
      try {
        await markFollowUpDone(activeClient._id, data);
        addToast('Outcome recorded and follow-up scheduled!', 'success');
      } catch (err) {
        addToast('Error updating outcome', 'error');
      }
    });
  };

  const handleAddNew = () => {
    runProtected(() => {
      setEditingClient(null);
      setIsModalOpen(true);
    });
  };

  const getWhatsAppLink = (client: any) => {
    if (!client.phoneNumber) return null;
    const cleaned = client.phoneNumber.replace(/[\s+\-()]/g, '');
    if (!/^\d{7,15}$/.test(cleaned)) return null;
    const message = encodeURIComponent(`Hi ${client.name}, following up regarding ${client.projectName}`);
    return `https://wa.me/${cleaned}?text=${message}`;
  };

  const filteredClients = clients.filter(c => {
    const matchesCategory = filter === 'all' || c.status === filter;
    const matchesSearch = c.name.toLowerCase().includes(search.toLowerCase()) || 
                         c.projectName.toLowerCase().includes(search.toLowerCase());
    
    let matchesFollowUp = true;
    if (c.nextFollowUp) {
      const next = new Date(c.nextFollowUp);
      if (followUpFilter === 'overdue') matchesFollowUp = isPast(next) && !isToday(next);
      if (followUpFilter === 'today') matchesFollowUp = isToday(next);
      if (followUpFilter === 'upcoming') matchesFollowUp = !isPast(next) && !isToday(next);
    } else if (followUpFilter !== 'all') {
      matchesFollowUp = false;
    }

    const matchesHealth = healthFilter === 'all' || getClientHealthStatus(c.lastFollowUp).status === healthFilter;
    const matchesValue = !minValue || (c.expectedBudget || 0) >= minValue;
    const matchesSample = !hasSample || c.sampleProvided === true;

    return matchesCategory && matchesSearch && matchesFollowUp && matchesHealth && matchesValue && matchesSample && c.isActive !== false;
  });

  const isFiltered = filter !== 'all' || followUpFilter !== 'all' || healthFilter !== 'all' || minValue > 0 || hasSample || search !== '';

  const clearFilters = () => {
    setFilter('all');
    setFollowUpFilter('all');
    setHealthFilter('all');
    setMinValue(0);
    setHasSample(false);
    setSearch('');
  };

  return (
    <div className="pt-12 text-left relative">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Client Management</h1>
        
        <div className="flex flex-wrap items-center gap-2 sm:gap-3 w-full sm:w-auto">
          <button
            onClick={() => runProtected(() => setIsQuickAddOpen(true))}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 border border-primary text-primary px-3 sm:px-4 py-2 rounded-xl font-medium hover:bg-primary/5 transition-all whitespace-nowrap text-xs sm:text-sm"
          >
            <Zap size={14} /> Quick Add
          </button>
          
          <button 
            onClick={() => exportClientsToCSV(clients)}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 border border-[var(--border)] px-3 sm:px-4 py-2 rounded-xl font-medium hover:bg-black/5 dark:hover:bg-white/5 transition-all text-xs sm:text-sm"
          >
            <Download size={16} /> Export
          </button>
 
          <button onClick={handleAddNew} className="w-full sm:w-auto flex items-center justify-center gap-2 bg-primary text-primary-foreground px-5 py-2.5 rounded-xl font-bold hover:opacity-90 transition-opacity whitespace-nowrap text-sm sm:text-base shadow-lg shadow-primary/20">
            <Plus size={18} /> New Client
          </button>
        </div>
      </div>

      <div className="glass rounded-2xl p-3 md:p-6 mb-8 flex flex-col md:flex-row gap-4 justify-between items-center z-10 sticky top-20">
        <div className="flex space-x-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0 no-scrollbar">
          {['all', 'potential', 'confirmed', 'completed'].map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-4 py-2 rounded-xl font-bold capitalize whitespace-nowrap transition-all text-sm ${
                filter === tab 
                  ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20' 
                  : 'hover:bg-black/5 dark:hover:bg-white/5 opacity-60'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
        
        <div className="relative w-full md:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 opacity-30" size={16} />
          <input
            type="text"
            placeholder="Search clients..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-background/50 border border-[var(--border)] outline-none focus:ring-2 focus:ring-primary/20 transition-all text-sm"
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-8 bg-black/10 dark:bg-white/5 p-2 rounded-xl border border-[var(--border)] overflow-x-auto items-center">
        <span className="text-[10px] font-bold uppercase tracking-widest opacity-40 px-2 py-2">Filters:</span>
        
        {['all', 'overdue', 'today', 'upcoming'].map((f) => (
          <button
            key={f}
            onClick={() => setFollowUpFilter(f)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition-all ${
              followUpFilter === f 
                ? f === 'overdue' ? 'bg-red-600 text-white shadow-md' 
                : f === 'today' ? 'bg-amber-500 text-black shadow-md'
                : 'bg-indigo-600 text-white shadow-md'
                : 'hover:bg-black/5 dark:hover:bg-white/10 opacity-60'
            }`}
          >
            {f}
          </button>
        ))}

        {isFiltered && (
          <button 
            onClick={clearFilters}
            className="px-4 py-1.5 text-xs font-bold text-red-500 hover:bg-red-500/10 rounded-lg transition-all border border-red-500/20"
          >
            Clear All
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4">
        <AnimatePresence>
          {isLoading && (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="glass p-5 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 animate-pulse border-transparent">
                  <div className="space-y-2 w-full md:w-64">
                    <div className="h-6 w-3/4 bg-black/10 dark:bg-white/10 rounded-lg" />
                    <div className="h-4 w-1/2 bg-black/10 dark:bg-white/10 rounded-lg" />
                  </div>
                  <div className="flex gap-2 w-full md:w-auto">
                    <div className="h-10 w-24 bg-black/10 dark:bg-white/10 rounded-xl" />
                    <div className="h-10 w-24 bg-black/10 dark:bg-white/10 rounded-xl" />
                  </div>
                </div>
              ))}
            </div>
          )}
          {!isLoading && filteredClients.length === 0 && (
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center opacity-70 p-8 w-full">
              No clients found in this category.
            </motion.p>
          )}
          {filteredClients.map((client, i) => {
            const isOverdue = client.nextFollowUp && isPast(new Date(client.nextFollowUp)) && !isToday(new Date(client.nextFollowUp));
            const isDueToday = client.nextFollowUp && isToday(new Date(client.nextFollowUp));
            const health = getClientHealthStatus(client.lastFollowUp);
            const isCold = health.status === 'cold' && client.status !== 'completed';

            return (
              <motion.div
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: i * 0.05 }}
                key={client._id}
                className={`glass p-5 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 transition-all border-2 ${
                  client.status !== 'completed' && isOverdue ? 'border-red-500/40 shadow-[0_0_20px_rgba(239,68,68,0.15)] ring-1 ring-red-500/20' : 
                  client.status !== 'completed' && isDueToday ? 'border-amber-500/40 shadow-[0_0_20px_rgba(245,158,11,0.15)] ring-1 ring-amber-500/20' : 
                  isCold ? 'border-red-500/20 bg-red-500/[0.02] shadow-lg shadow-red-500/5' :
                  'border-transparent hover:border-primary/40'
                }`}
              >
                <div className="w-full md:w-auto text-left">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <h3 className="font-semibold text-lg">{client.name}</h3>
                    {filter === 'all' && <StatusBadge status={client.status as any} />}
                    {client.status !== 'completed' && <HealthBadge lastFollowUp={client.lastFollowUp} />}
                    {client.lastFollowUpOutcome && (
                      <span className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-lg border border-primary/20 shadow-sm animate-in fade-in zoom-in duration-300">
                        Last: {client.lastFollowUpOutcome}
                      </span>
                    )}
                  </div>
                  <p className="text-sm opacity-70 mb-1">{client.projectName}</p>
                  <p className="text-[10px] font-bold opacity-40 uppercase tracking-tighter mb-2">Joined: {format(new Date(client.createdAt), 'dd/MM/yy')}</p>
                  
                  {client.shares && client.shares.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-3">
                      {client.shares.filter((s:any) => s.percentage > 0).map((s:any, idx:number) => {
                        const amount = ((client.status === 'potential' ? client.expectedBudget : client.status === 'confirmed' ? client.totalAmount : client.finalAmount) || 0) * s.percentage / 100;
                        return (
                          <div key={idx} className="flex items-center gap-1.5 bg-black/5 dark:bg-white/5 px-2 py-1 rounded-lg border border-transparent hover:border-primary/10 transition-all">
                            <div className="w-4 h-4 rounded bg-primary/10 text-primary flex items-center justify-center text-[10px] font-bold uppercase">
                              {(s.userId.name || 'U').charAt(0)}
                            </div>
                            <span className="text-[10px] font-bold opacity-60">{s.percentage}%</span>
                            <span className="text-[10px] font-mono opacity-40">₹{amount.toLocaleString('en-IN')}</span>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {(filter === 'potential' || (filter === 'all' && client.status === 'potential')) && <p className="text-xs font-semibold text-blue-500 mt-1">Budget: ₹{client.expectedBudget}</p>}
                  {(filter === 'confirmed' || (filter === 'all' && client.status === 'confirmed')) && (
                    <div className="flex flex-col gap-1 mt-1">
                      <p className="text-xs font-semibold text-amber-500">Advance: ₹{client.advanceAmount}</p>
                      {client.startDate && <p className="text-[10px] opacity-60">Started: {format(new Date(client.startDate), 'dd/MM/yy')}</p>}
                    </div>
                  )}
                  {(filter === 'completed' || (filter === 'all' && client.status === 'completed')) && (
                    <div className="flex flex-col gap-1 mt-1">
                      <p className="text-xs font-semibold text-green-500">Final: ₹{client.finalAmount}</p>
                      {client.completionDate && <p className="text-[10px] opacity-60">Finished: {format(new Date(client.completionDate), 'dd/MM/yy')}</p>}
                    </div>
                  )}
                  
                  {client.sampleProvided && client.sampleLink && (
                    <a 
                      href={client.sampleLink} 
                      target="_blank" 
                      rel="noreferrer" 
                      className="inline-flex items-center gap-1.5 mt-3 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors bg-blue-500/10 hover:bg-blue-500/20 px-2.5 py-2 rounded-xl"
                    >
                      <LinkIcon size={12} /> {client.status === 'completed' ? 'View Website' : 'View Sample'}
                    </a>
                  )}

                  {client.status !== 'completed' && client.nextFollowUp && (
                    <div className="mt-4">
                      <FollowUpBadge nextDate={client.nextFollowUp} lastDate={client.lastFollowUp} />
                    </div>
                  )}
                </div>
                
                <div className="flex flex-col sm:flex-row sm:items-center gap-3 w-full md:w-auto justify-end mt-2 md:mt-0 pt-4 md:pt-0 border-t md:border-none border-[var(--border)]">
                  <div className="flex flex-wrap items-center gap-2">
                    {client.status === 'potential' && isOwner && (
                      <button 
                        onClick={() => handleUpgradeStatus(client, 'confirmed')}
                        className="flex-1 sm:flex-none text-[10px] sm:text-xs font-bold px-3 py-2 bg-amber-500 text-black rounded-xl hover:scale-105 active:scale-95 transition-all shadow-md shadow-amber-500/10 whitespace-nowrap"
                      >
                        Confirm Project
                      </button>
                    )}
                    {client.status === 'confirmed' && isOwner && (
                      <button 
                        onClick={() => handleUpgradeStatus(client, 'completed')}
                        className="flex-1 sm:flex-none text-[10px] sm:text-xs font-bold px-3 py-2 bg-green-600 text-white rounded-xl hover:scale-105 active:scale-95 transition-all shadow-md shadow-green-600/10 whitespace-nowrap"
                      >
                        Mark Completed
                      </button>
                    )}
 
                    {client.status !== 'completed' && (
                      <button 
                        onClick={() => handleMarkFollowUpDone(client)}
                        className="flex-1 sm:flex-none flex items-center justify-center gap-2 group text-[10px] sm:text-xs font-bold px-3 py-2 bg-indigo-600 text-white rounded-xl hover:scale-105 active:scale-95 transition-all shadow-md shadow-indigo-600/10 whitespace-nowrap"
                        title="Mark latest follow-up as completed"
                      >
                        <CheckCheck size={14} className="group-hover:scale-110 transition-transform" />
                        <span>Done</span>
                      </button>
                    )}
                  </div>
 
                  <div className="flex items-center justify-end bg-black/5 dark:bg-white/5 p-1 rounded-xl w-fit self-end sm:self-auto">
                    {(() => {
                      const waLink = getWhatsAppLink(client);
                      return (
                        <button
                          onClick={() => waLink && window.open(waLink, '_blank')}
                          title={waLink ? 'Message on WhatsApp' : 'No phone number available'}
                          className={`p-2 rounded-lg transition-all ${
                            waLink
                              ? 'text-[#25D366] hover:bg-[#25D366]/10 hover:scale-110 active:scale-95'
                              : 'text-[#25D366]/30 cursor-not-allowed'
                          }`}
                        >
                          <MessageCircle size={18} />
                        </button>
                      );
                    })()}
                    <button 
                      onClick={() => handleEdit(client)}
                      className="p-2 rounded-lg hover:bg-black/10 dark:hover:bg-white/10 text-primary transition-colors"
                    >
                      <Edit size={18} />
                    </button>
                    <button 
                      onClick={() => handleDelete(client._id)}
                      className="p-2 rounded-lg hover:bg-red-500/10 text-red-500 transition-colors"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      <ClientModal 
        isOpen={isModalOpen} 
        onClose={() => {
          setIsModalOpen(false);
          setEditingClient(null);
        }} 
        initialData={editingClient}
      />

      <QuickAddModal
        isOpen={isQuickAddOpen}
        onClose={() => setIsQuickAddOpen(false)}
        onAddDetails={(client) => {
          setEditingClient(client);
          setIsModalOpen(true);
        }}
      />

      <FollowUpOutcomeModal
        isOpen={isOutcomeModalOpen}
        onClose={() => {
          setIsOutcomeModalOpen(false);
          setActiveClient(null);
        }}
        onSubmit={handleOutcomeSubmit}
        clientName={activeClient?.name || ''}
      />
    </div>
  );
}

export default function ClientsPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center animate-pulse">Loading clients...</div>}>
      <ClientsContent />
    </Suspense>
  );
}
