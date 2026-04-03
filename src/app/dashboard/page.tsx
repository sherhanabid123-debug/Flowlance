'use client';

import { useEffect, useMemo, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useClientStore } from '@/store/useClientStore';
import { useWorkspaceStore } from '@/store/useWorkspaceStore';
import { useAuthStore } from '@/store/useAuthStore';
import { Users, CheckCircle, Wallet, Target, TrendingUp, AlertCircle, Clock, CheckCheck, ArrowRight, Zap, Plus } from 'lucide-react';
import { ClientModal } from '@/components/ui/ClientModal';
import { QuickAddModal } from '@/components/ui/QuickAddModal';
import { FollowUpOutcomeModal } from '@/components/ui/FollowUpOutcomeModal';
import { LineChart, Line, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { formatDistanceToNow, isPast, isToday } from 'date-fns';
import Link from 'next/link';
import { useToastStore } from '@/store/useToastStore';
import { HealthBadge } from '@/components/ui/HealthBadge';
import { getClientHealthStatus } from '@/lib/clientHealth';
import { SmartInsights } from '@/components/dashboard/SmartInsights';
import { useAuthBarrier } from '@/hooks/useAuthBarrier';

interface MonthlyStat {
  name: string;
  sales: number;
  index: number;
  year: number;
}

import { FirstClientCTA } from '@/components/dashboard/FirstClientCTA';

export default function DashboardOverview() {
  const { clients, setClients, isLoading, setLoading, markFollowUpDone } = useClientStore();
  const { workspace } = useWorkspaceStore();
  const { user } = useAuthStore();
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set());
  const [showAll, setShowAll] = useState(false);
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<any>(null);
  const [isOutcomeModalOpen, setIsOutcomeModalOpen] = useState(false);
  const [activeClient, setActiveClient] = useState<any>(null);

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

  const { overdueFollowUps, todayFollowUps } = useMemo(() => {
    const active = clients.filter(c =>
      c.nextFollowUp &&
      c.status !== 'completed' &&
      !dismissedIds.has(c._id)
    );
    const overdue = active
      .filter(c => isPast(new Date(c.nextFollowUp)) && !isToday(new Date(c.nextFollowUp)))
      .sort((a, b) => new Date(a.nextFollowUp).getTime() - new Date(b.nextFollowUp).getTime());
    const today = active
      .filter(c => isToday(new Date(c.nextFollowUp)))
      .sort((a, b) => a.name.localeCompare(b.name));
    return { overdueFollowUps: overdue, todayFollowUps: today };
  }, [clients, dismissedIds]);

  const { addToast } = useToastStore();
  const alertTriggered = useRef(false);

  useEffect(() => {
    if (!isLoading && clients.length > 0 && !alertTriggered.current) {
      const total = overdueFollowUps.length + todayFollowUps.length;
      if (total > 0) {
        addToast(`You have ${total} follow-up${total > 1 ? 's' : ''} to handle today.`, 'info');
        alertTriggered.current = true;
      }
    }
  }, [isLoading, clients.length, overdueFollowUps.length, todayFollowUps.length, addToast]);

  const metrics = useMemo(() => {
    let potential = 0, confirmed = 0, completed = 0, potentialRevenue = 0, totalSales = 0, myEarnings = 0;
    
    clients.forEach(c => {
      if (c.status === 'potential') {
        potential++;
        potentialRevenue += (c.expectedBudget || 0);
      } else if (c.status === 'confirmed') {
        confirmed++;
      } else if (c.status === 'completed') {
        completed++;
        totalSales += (c.finalAmount || 0);

        // Calculate personal earnings
        const getUID = (id: any) => (id?._id || id || '').toString();
        const myId = user?._id || '';

        if (c.shares && c.shares.length > 0) {
          const myShare = c.shares.find((s: any) => getUID(s.userId) === myId);
          if (myShare) {
            myEarnings += (c.finalAmount * myShare.percentage) / 100;
          }
        } else {
          // Default: Owner gets 100% if no shares defined
          const ownerIdString = getUID(workspace?.ownerId);
          if (ownerIdString === myId) {
            myEarnings += (c.finalAmount || 0);
          }
        }
      }
    });
    return { potential, confirmed, completed, totalSales, potentialRevenue, myEarnings, totalClients: clients.length };
  }, [clients, user?._id, workspace?.ownerId]);

  const chartData = useMemo(() => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const currentYear = new Date().getFullYear();
    
    // Initialize all 12 months of the current year with 0 revenue
    const timeline = months.map((month, index) => ({
      name: month,
      sales: 0,
      index,
      year: currentYear
    }));

    // Fill with real data from completed clients
    clients.forEach(c => {
      if (c.status !== 'completed' || !c.completionDate) return;
      
      const date = new Date(c.completionDate);
      const m = date.getMonth();
      const y = date.getFullYear();

      // Only count revenue for the current year
      if (y === currentYear) {
        timeline[m].sales += (c.finalAmount || 0);
      }
    });

    return timeline.map(({ name, sales }) => ({ name, sales }));
  }, [clients]);

  const allFollowUps = useMemo(() => [...overdueFollowUps, ...todayFollowUps], [overdueFollowUps, todayFollowUps]);
  const LIMIT = 5;
  const visibleFollowUps = showAll ? allFollowUps : allFollowUps.slice(0, LIMIT);
  const hasMore = allFollowUps.length > LIMIT;

  const handleMarkDone = (client: any) => {
    setActiveClient(client);
    setIsOutcomeModalOpen(true);
  };

  const handleOutcomeSubmit = async (data: any) => {
    runProtected(async () => {
      if (!activeClient) return;
      const clientId = activeClient._id;
      setDismissedIds(prev => new Set(prev).add(clientId));
      try {
        await markFollowUpDone(clientId, data);
        addToast('Outcome recorded and follow-up scheduled!', 'success');
      } catch {
        setDismissedIds(prev => { const s = new Set(prev); s.delete(clientId); return s; });
        addToast('Error updating follow-up', 'error');
      }
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-6 pt-12 animate-pulse">
        <div className="h-10 w-48 bg-black/10 dark:bg-white/10 rounded-xl mb-4" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="glass p-6 rounded-2xl h-24 bg-black/5 dark:bg-white/5 border-transparent" />
          ))}
        </div>
        <div className="glass p-6 rounded-2xl h-80 bg-black/5 dark:bg-white/5 border-transparent" />
      </div>
    );
  }

  const statCards = [
    { title: 'Total Revenue', value: `₹${metrics.totalSales.toLocaleString('en-IN')}`, icon: Wallet, color: 'text-white', bg: 'bg-green-600 shadow-lg shadow-green-600/10', tooltip: 'Total actual income from completed projects' },
    { title: 'My Earnings', value: `₹${metrics.myEarnings.toLocaleString('en-IN')}`, icon: CheckCheck, color: 'text-white', bg: 'bg-indigo-600 shadow-lg shadow-indigo-600/10', tooltip: 'Your personal share of revenue across all completed projects' },
    { title: 'Potential Revenue', value: `₹${metrics.potentialRevenue.toLocaleString('en-IN')}`, icon: TrendingUp, color: 'text-white', bg: 'bg-blue-600 shadow-lg shadow-blue-600/10', tooltip: 'Total estimated revenue from potential clients' },
    { title: 'Total Clients', value: metrics.totalClients, icon: Users, color: 'text-white', bg: 'bg-black/40 shadow-lg', tooltip: 'Sum of all clients in your database' },
    { title: 'Active Projects', value: metrics.confirmed, icon: Target, color: 'text-black', bg: 'bg-amber-500 shadow-lg shadow-amber-500/10', tooltip: 'Currently active (confirmed) projects' },
  ];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 flex flex-col pt-12 relative animate-in fade-in">
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
        <h1 className="text-2xl sm:text-3xl font-bold">Overview</h1>
        <div className="flex items-center gap-3">
          <button
            onClick={() => runProtected(() => setIsQuickAddOpen(true))}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 border border-primary text-primary px-4 py-2.5 rounded-xl font-medium hover:bg-primary/5 transition-all whitespace-nowrap text-sm"
          >
            <Zap size={15} /> Quick Add Client
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 sm:gap-6">
        {statCards.map((stat, i) => (
          <motion.div
            key={i}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: i * 0.1 }}
            className="glass p-4 sm:p-6 rounded-2xl flex items-center justify-between group relative h-full"
            title={stat.tooltip}
          >
            <div>
              <p className="text-xs sm:text-sm font-medium opacity-70 mb-1">{stat.title}</p>
              <h3 className="text-xl sm:text-2xl font-bold tracking-tight">{stat.value}</h3>
            </div>
            <div className={`p-3 sm:p-4 rounded-xl ${stat.bg} ${stat.color} transition-transform group-hover:scale-110`}>
              <stat.icon size={20} className="sm:size-6" />
            </div>
          </motion.div>
        ))}
      </div>

      <div className="glass p-6 rounded-2xl mt-8">
        <h3 className="text-xl font-semibold mb-6">Revenue Overview</h3>
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.1} />
              <XAxis dataKey="name" strokeOpacity={0.5} />
              <YAxis strokeOpacity={0.5} />
              <RechartsTooltip
                contentStyle={{ borderRadius: '12px', border: '1px solid var(--border)', background: 'var(--card)' }}
                itemStyle={{ color: 'var(--foreground)' }}
              />
              <Line type="monotone" dataKey="sales" stroke="var(--primary)" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 8 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Today's Follow-ups Widget */}
        <div className="lg:col-span-2 glass p-6 rounded-2xl">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold flex items-center gap-2">
              <Clock className="text-indigo-500" size={20} />
              Today's Follow-ups
            </h3>
            <div className="flex items-center gap-2">
              {overdueFollowUps.length > 0 && (
                <span className="bg-red-500/10 text-red-500 px-2.5 py-1 rounded-full text-xs font-bold">
                  {overdueFollowUps.length} Overdue
                </span>
              )}
              {todayFollowUps.length > 0 && (
                <span className="bg-amber-500/10 text-amber-500 px-2.5 py-1 rounded-full text-xs font-bold">
                  {todayFollowUps.length} Today
                </span>
              )}
            </div>
          </div>

          <div className="space-y-3">
            <AnimatePresence initial={false}>
              {allFollowUps.length === 0 ? (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex flex-col items-center justify-center py-12 opacity-50 text-sm"
                >
                  <CheckCheck size={40} className="mb-3 opacity-40" />
                  <p className="font-semibold text-base">You're all caught up 🎉</p>
                  <p className="text-xs opacity-70 mt-1">No follow-ups due today.</p>
                </motion.div>
              ) : (
                <>
                  {overdueFollowUps.length > 0 && visibleFollowUps.some(c => overdueFollowUps.includes(c)) && (
                    <div className="flex items-center gap-2 mb-1">
                      <AlertCircle size={13} className="text-red-500" />
                      <span className="text-[10px] font-bold uppercase tracking-widest text-red-500">Overdue</span>
                    </div>
                  )}

                  {visibleFollowUps.map(client => {
                    const isOverdue = overdueFollowUps.includes(client);
                    const isFirstToday = !isOverdue && visibleFollowUps.find(c => !overdueFollowUps.includes(c)) === client;
                    return (
                      <div key={client._id}>
                        {isFirstToday && (
                          <div className="flex items-center gap-2 mt-3 mb-1">
                            <Clock size={13} className="text-amber-500" />
                            <span className="text-[10px] font-bold uppercase tracking-widest text-amber-500">Due Today</span>
                          </div>
                        )}
                        <motion.div
                          layout
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 20, height: 0, marginBottom: 0 }}
                          transition={{ duration: 0.2 }}
                          className={`flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 rounded-xl border transition-all gap-4 ${
                            isOverdue
                              ? 'bg-red-500/5 border-red-500/20 hover:border-red-500/40'
                              : 'bg-amber-500/5 border-amber-500/20 hover:border-amber-500/40'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-lg shrink-0 ${isOverdue ? 'bg-red-500/10 text-red-500' : 'bg-amber-500/10 text-amber-500'}`}>
                              {isOverdue ? <AlertCircle size={18} /> : <Clock size={18} />}
                            </div>
                             <div>
                              <div className="flex items-center gap-2">
                                <h4 className="font-bold text-sm">{client.name}</h4>
                                <HealthBadge lastFollowUp={client.lastFollowUp} compact />
                              </div>
                              <p className="text-xs opacity-60">{client.projectName}</p>
                              <p className={`text-[11px] font-semibold mt-0.5 ${isOverdue ? 'text-red-500' : 'text-amber-500'}`}>
                                {isOverdue
                                  ? `${formatDistanceToNow(new Date(client.nextFollowUp))} overdue`
                                  : 'Due today'}
                              </p>
                            </div>
                          </div>
                          <button
                            onClick={() => handleMarkDone(client)}
                            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold hover:scale-105 active:scale-95 transition-all shadow-md shadow-indigo-600/20 whitespace-nowrap shrink-0"
                          >
                            <CheckCheck size={14} />
                            Mark Done
                          </button>
                        </motion.div>
                      </div>
                    );
                  })}

                  {hasMore && (
                    <button
                      onClick={() => setShowAll(prev => !prev)}
                      className="w-full mt-2 py-2.5 text-xs font-bold text-primary hover:bg-primary/5 rounded-xl transition-colors flex items-center justify-center gap-1"
                    >
                      {showAll ? 'Show Less' : `View All (${allFollowUps.length})`}
                      <ArrowRight size={14} className={`transition-transform ${showAll ? 'rotate-90' : ''}`} />
                    </button>
                  )}
                </>
              )}
            </AnimatePresence>
          </div>

          {allFollowUps.length > 0 && (
            <div className="mt-4 pt-4 border-t border-[var(--border)]">
              <Link href="/dashboard/clients" className="text-xs font-bold text-primary hover:underline flex items-center gap-1">
                Go to Client Management <ArrowRight size={12} />
              </Link>
            </div>
          )}
        </div>

        <div className="lg:col-span-1">
          <SmartInsights clients={clients} />
        </div>
      </div>
      
      <ClientModal 
        isOpen={isEditModalOpen} 
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingClient(null);
        }} 
        initialData={editingClient}
      />

      <QuickAddModal
        isOpen={isQuickAddOpen}
        onClose={() => setIsQuickAddOpen(false)}
        onAddDetails={(client) => {
          setEditingClient(client);
          setIsEditModalOpen(true);
        }}
      />

      <FirstClientCTA 
        isVisible={isAuthenticated && !isLoading && clients.length === 0}
        onOpenQuickAdd={() => setIsQuickAddOpen(true)}
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
    </motion.div>
  );
}
