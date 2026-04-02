'use client';

import { useEffect, useMemo, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useClientStore } from '@/store/useClientStore';
import { useWorkspaceStore } from '@/store/useWorkspaceStore';
import { useAuthStore } from '@/store/useAuthStore';
import { 
  Users, Wallet, Target, TrendingUp, AlertCircle, 
  Clock, CheckCheck, ArrowRight, Plus 
} from 'lucide-react';
import { ClientModal } from '@/components/ui/ClientModal';
import { QuickAddModal } from '@/components/ui/QuickAddModal';
import { 
  LineChart, Line, XAxis, YAxis, Tooltip as RechartsTooltip, 
  ResponsiveContainer, CartesianGrid 
} from 'recharts';
import { formatDistanceToNow, isPast, isToday } from 'date-fns';
import Link from 'next/link';
import { useToastStore } from '@/store/useToastStore';
import { HealthBadge } from '@/components/ui/HealthBadge';
import { SmartInsights } from '@/components/dashboard/SmartInsights';
import { useAuthBarrier } from '@/hooks/useAuthBarrier';
import { MOCK_CLIENTS } from '@/lib/mockClients';
import { GuestBanner } from '@/components/layout/GuestBanner';
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

  const { runProtected, isAuthenticated } = useAuthBarrier();

  useEffect(() => {
    if (!isAuthenticated) {
      setClients(MOCK_CLIENTS);
      setLoading(false);
      return;
    }
    
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

  const handleMarkDone = async (clientId: string) => {
    runProtected(async () => {
      setDismissedIds(prev => new Set(prev).add(clientId));
      try {
        await markFollowUpDone(clientId);
      } catch {
        setDismissedIds(prev => { const s = new Set(prev); s.delete(clientId); return s; });
      }
    });
  };

  if (isLoading) {
    return <div className="flex h-64 items-center justify-center animate-pulse text-primary font-bold">Loading metrics...</div>;
  }

  const statCards = [
    { title: 'Total Revenue', value: `₹${metrics.totalSales.toLocaleString('en-IN')}`, icon: Wallet, color: 'text-white', bg: 'bg-green-600 shadow-lg shadow-green-600/10', tooltip: 'Total actual income from completed projects' },
    { title: 'My Earnings', value: `₹${metrics.myEarnings.toLocaleString('en-IN')}`, icon: CheckCheck, color: 'text-white', bg: 'bg-indigo-600 shadow-lg shadow-indigo-600/10', tooltip: 'Your personal share of revenue across all completed projects' },
    { title: 'Potential Revenue', value: `₹${metrics.potentialRevenue.toLocaleString('en-IN')}`, icon: TrendingUp, color: 'text-white', bg: 'bg-blue-600 shadow-lg shadow-blue-600/10', tooltip: 'Total estimated revenue from potential clients' },
    { title: 'Total Clients', value: metrics.totalClients, icon: Users, color: 'text-white', bg: 'bg-black/40 shadow-lg', tooltip: 'Sum of all clients in your database' },
    { title: 'Active Projects', value: metrics.confirmed, icon: Target, color: 'text-black', bg: 'bg-amber-500 shadow-lg shadow-amber-500/10', tooltip: 'Currently active (confirmed) projects' },
  ];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 flex flex-col pt-4 md:pt-12 relative animate-in fade-in pb-24">
      <GuestBanner />
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Dashboard Overview</h1>
        <div className="flex items-center gap-3">
          <button
            onClick={() => runProtected(() => setIsQuickAddOpen(true))}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-primary text-primary-foreground px-4 py-2.5 rounded-xl font-bold hover:opacity-90 transition-all active:scale-95 shadow-lg shadow-primary/20 text-sm whitespace-nowrap"
          >
            <Plus size={18} /> Quick Add
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 md:gap-6">
        {statCards.map((stat, i) => (
          <motion.div
            key={i}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: i * 0.1 }}
            className="glass p-5 md:p-6 rounded-2xl flex items-center justify-between group relative h-full border border-white/5"
            title={stat.tooltip}
          >
            <div>
              <p className="text-xs font-bold uppercase tracking-widest opacity-40 mb-1">{stat.title}</p>
              <h3 className="text-xl md:text-2xl font-black tracking-tight">{stat.value}</h3>
            </div>
            <div className={`p-3 md:p-4 rounded-xl ${stat.bg} ${stat.color} transition-transform group-hover:scale-110 shrink-0 shadow-xl`}>
              <stat.icon size={20} />
            </div>
          </motion.div>
        ))}
      </div>

      <div className="glass p-4 md:p-6 rounded-2xl md:mt-8">
        <h3 className="text-lg md:text-xl font-bold mb-6 flex items-center gap-2">
          <TrendingUp className="text-primary" size={20} />
          Revenue Growth
        </h3>
        <div className="h-64 md:h-80 w-full overflow-hidden">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.05} vertical={false} />
              <XAxis 
                dataKey="name" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 10, opacity: 0.5 }} 
                dy={10}
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 10, opacity: 0.5 }} 
              />
              <RechartsTooltip
                contentStyle={{ 
                  borderRadius: '16px', 
                  border: '1px solid var(--border)', 
                  background: 'rgba(var(--card-rgb), 0.8)',
                  backdropFilter: 'blur(12px)',
                  boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
                  padding: '12px'
                }}
                itemStyle={{ color: 'var(--primary)', fontWeight: 'bold' }}
              />
              <Line 
                type="monotone" 
                dataKey="sales" 
                stroke="var(--primary)" 
                strokeWidth={4} 
                dot={{ r: 4, strokeWidth: 2, fill: 'var(--background)' }} 
                activeDot={{ r: 8, strokeWidth: 0 }} 
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Today's Follow-ups Widget */}
        <div className="lg:col-span-2 glass p-5 md:p-6 rounded-2xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <h3 className="text-lg md:text-xl font-bold flex items-center gap-2">
              <Clock className="text-indigo-500" size={20} />
              Queue & Actions
            </h3>
            <div className="flex items-center gap-2">
              {overdueFollowUps.length > 0 && (
                <span className="bg-red-500 text-white px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-tighter">
                  {overdueFollowUps.length} Overdue
                </span>
              )}
              {todayFollowUps.length > 0 && (
                <span className="bg-amber-500 text-black px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-tighter">
                  {todayFollowUps.length} Due
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
                  className="flex flex-col items-center justify-center py-12 text-center"
                >
                  <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mb-4">
                    <CheckCheck size={32} className="text-green-500" />
                  </div>
                  <p className="font-bold text-lg">Clear Horizon</p>
                  <p className="text-xs opacity-50 mt-1 max-w-[200px]">All your follow-ups are completed for now.</p>
                </motion.div>
              ) : (
                <>
                  {visibleFollowUps.map(client => {
                    const isOverdue = overdueFollowUps.includes(client);
                    return (
                      <motion.div
                        key={client._id}
                        layout
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95, x: 20 }}
                        className={`flex flex-col sm:flex-row items-stretch sm:items-center justify-between p-4 rounded-xl border transition-all gap-4 group ${
                          isOverdue
                            ? 'bg-red-500/5 border-red-500/10 hover:border-red-500/20'
                            : 'bg-primary/5 border-primary/10 hover:border-primary/20'
                        }`}
                      >
                        <div className="flex items-center gap-4">
                          <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 shadow-sm ${isOverdue ? 'bg-red-500 text-white' : 'bg-primary text-primary-foreground'}`}>
                            {isOverdue ? <AlertCircle size={20} /> : <Clock size={20} />}
                          </div>
                           <div className="min-w-0">
                            <div className="flex items-center gap-2 mb-0.5">
                              <h4 className="font-bold text-sm truncate">{client.name}</h4>
                              <HealthBadge lastFollowUp={client.lastFollowUp} compact />
                            </div>
                            <div className="flex items-center gap-2 text-[10px] opacity-40 font-bold uppercase tracking-wider">
                              <span className="truncate max-w-[100px]">{client.projectName}</span>
                              <span>•</span>
                              <span className={isOverdue ? 'text-red-500' : 'text-primary'}>
                                {isOverdue ? `${formatDistanceToNow(new Date(client.nextFollowUp))} late` : 'Today'}
                              </span>
                            </div>
                          </div>
                        </div>
                        <button
                          onClick={() => handleMarkDone(client._id)}
                          className="h-10 px-6 rounded-xl bg-primary text-primary-foreground text-xs font-black hover:scale-105 active:scale-95 transition-all shadow-lg shadow-primary/20 uppercase tracking-widest sm:w-auto"
                        >
                          Resolve
                        </button>
                      </motion.div>
                    );
                  })}

                  {hasMore && (
                    <button
                      onClick={() => setShowAll(prev => !prev)}
                      className="w-full mt-2 py-3 text-[10px] font-black uppercase tracking-widest text-primary hover:bg-primary/5 rounded-xl transition-colors flex items-center justify-center gap-2"
                    >
                      {showAll ? 'Collapse List' : `View All Tasks (${allFollowUps.length})`}
                      <ArrowRight size={14} className={`transition-transform ${showAll ? '-rotate-90' : ''}`} />
                    </button>
                  )}
                </>
              )}
            </AnimatePresence>
          </div>
        </div>

        <div className="lg:col-span-1">
          <SmartInsights clients={clients} />
        </div>
      </div>

      <FirstClientCTA />
      
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
    </motion.div>
  );
}
