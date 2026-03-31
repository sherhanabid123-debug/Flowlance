'use client';

import { useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useClientStore } from '@/store/useClientStore';
import { Users, CheckCircle, Wallet, Target, TrendingUp, AlertCircle, Clock, CheckCheck } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { isPast, isToday } from 'date-fns';
import { FollowUpBadge } from '@/components/ui/FollowUpBadge';

export default function DashboardOverview() {
  const { clients, setClients, isLoading, setLoading } = useClientStore();

  useEffect(() => {
    const fetchClients = async () => {
      try {
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
  }, [setClients, setLoading]);

  const metrics = useMemo(() => {
    let potential = 0;
    let confirmed = 0;
    let completed = 0;
    let potentialRevenue = 0;
    let totalSales = 0;

    clients.forEach(c => {
      if (c.status === 'potential') {
        potential++;
        potentialRevenue += (c.expectedBudget || 0);
      }
      if (c.status === 'confirmed') {
        confirmed++;
        totalSales += (c.advanceAmount || 0);
      }
      if (c.status === 'completed') {
        completed++;
        totalSales += (c.finalAmount || 0);
      }
    });

    return { potential, confirmed, completed, totalSales, potentialRevenue, totalClients: clients.length };
  }, [clients]);

  // Properly aggregate real chart data from the clients list starting from Jan
  const chartData = useMemo(() => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    interface MonthlyStat {
      name: string;
      sales: number;
      index: number;
      year: number;
    }

    // Initialize months from Jan to current month
    const timeline: MonthlyStat[] = [];
    for (let i = 0; i <= currentMonth; i++) {
      timeline.push({
        name: months[i],
        sales: i === 1 ? 8000 : 0, // Start Feb with 8k as requested
        index: i,
        year: currentYear
      });
    }

    clients.forEach(c => {
      if (!c.createdAt) return;
      const date = new Date(c.createdAt);
      const m = date.getMonth();
      const y = date.getFullYear();
      
      // Calculate revenue contribution
      let amount = 0;
      if (c.status === 'confirmed') amount = c.advanceAmount || 0;
      if (c.status === 'completed') amount = c.finalAmount || 0;

      // Add to the corresponding month in our timeline
      const targetMonth = timeline.find(t => t.index === m && t.year === y);
      if (targetMonth) {
        targetMonth.sales += amount;
      }
    });

    return timeline.map(({ name, sales }) => ({ name, sales }));
  }, [clients]);

  const dueFollowUps = useMemo(() => {
    return clients
      .filter(c => c.nextFollowUp && (isPast(new Date(c.nextFollowUp)) || isToday(new Date(c.nextFollowUp))))
      .sort((a, b) => new Date(a.nextFollowUp).getTime() - new Date(b.nextFollowUp).getTime());
  }, [clients]);

  if (isLoading) {
    return <div className="flex h-64 items-center justify-center animate-pulse text-primary font-bold">Loading metrics...</div>;
  }

  const statCards = [
    { title: 'Total Revenue', value: `₹${metrics.totalSales.toLocaleString('en-IN')}`, icon: Wallet, color: 'text-white', bg: 'bg-green-600 shadow-lg shadow-green-600/10', tooltip: 'Total actual income from confirmed & completed projects' },
    { title: 'Potential Revenue', value: `₹${metrics.potentialRevenue.toLocaleString('en-IN')}`, icon: TrendingUp, color: 'text-white', bg: 'bg-indigo-600 shadow-lg shadow-indigo-600/10', tooltip: 'Total estimated revenue from potential clients' },
    { title: 'Total Clients', value: metrics.totalClients, icon: Users, color: 'text-white', bg: 'bg-blue-600 shadow-lg shadow-blue-600/10', tooltip: 'Sum of all clients in your database' },
    { title: 'Active Projects', value: metrics.confirmed, icon: Target, color: 'text-black', bg: 'bg-amber-500 shadow-lg shadow-amber-500/10', tooltip: 'Currently active (confirmed) projects' },
    { title: 'Completed', value: metrics.completed, icon: CheckCircle, color: 'text-white', bg: 'bg-primary shadow-lg shadow-primary/10', tooltip: 'Successfully archived projects' },
  ];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 flex flex-col pt-8 animate-in fade-in">
      <h1 className="text-3xl font-bold mb-4">Overview</h1>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
        {statCards.map((stat, i) => (
          <motion.div 
            key={i}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: i * 0.1 }}
            className="glass p-6 rounded-2xl flex items-center justify-between group relative h-full"
            title={stat.tooltip}
          >
            <div>
              <p className="text-sm font-medium opacity-70 mb-1">{stat.title}</p>
              <h3 className="text-2xl font-bold tracking-tight">{stat.value}</h3>
            </div>
            <div className={`p-4 rounded-xl ${stat.bg} ${stat.color} transition-transform group-hover:scale-110`}>
              <stat.icon size={24} />
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
        <div className="lg:col-span-2 glass p-6 rounded-2xl">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold flex items-center gap-2">
              <Clock className="text-indigo-500" size={20} />
              Follow-ups Due
            </h3>
            <span className="bg-indigo-500/10 text-indigo-500 px-2.5 py-1 rounded-full text-xs font-bold">
              {dueFollowUps.length} Priority
            </span>
          </div>

          <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
            {dueFollowUps.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 opacity-40 italic text-sm">
                <CheckCheck size={40} className="mb-2 opacity-20" />
                No follow-ups due today. You're all caught up!
              </div>
            ) : (
              dueFollowUps.map((client) => (
                <div key={client._id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 rounded-xl bg-black/5 dark:bg-white/5 border border-[var(--border)] hover:border-indigo-500/30 transition-all gap-4">
                  <div className="flex items-center gap-4">
                    <div className={`p-2.5 rounded-lg ${isPast(new Date(client.nextFollowUp)) && !isToday(new Date(client.nextFollowUp)) ? 'bg-red-500/10 text-red-500' : 'bg-amber-500/10 text-amber-500'}`}>
                      {isPast(new Date(client.nextFollowUp)) && !isToday(new Date(client.nextFollowUp)) ? <AlertCircle size={20} /> : <Clock size={20} />}
                    </div>
                    <div>
                      <h4 className="font-bold text-sm">{client.name}</h4>
                      <p className="text-xs opacity-60">{client.projectName}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
                    <FollowUpBadge nextDate={client.nextFollowUp} />
                    <button 
                      onClick={() => useClientStore.getState().markFollowUpDone(client._id)}
                      className="p-2 rounded-lg bg-indigo-600 text-white hover:scale-110 active:scale-95 transition-all shadow-md shadow-indigo-600/20"
                      title="Mark Done"
                    >
                      <CheckCheck size={16} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="glass p-6 rounded-2xl flex flex-col justify-center items-center text-center space-y-4">
          <div className="p-4 rounded-full bg-primary/10 text-primary">
            <TrendingUp size={32} />
          </div>
          <h4 className="text-lg font-bold">Proactive Growth</h4>
          <p className="text-sm opacity-60">
            Following up within 48 hours increases conversion rates by up to 60%. Use your auto-scheduled reminders to stay ahead.
          </p>
        </div>
      </div>
    </motion.div>
  );
}
