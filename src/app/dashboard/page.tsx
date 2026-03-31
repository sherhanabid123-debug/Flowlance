'use client';

import { useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useClientStore } from '@/store/useClientStore';
import { Users, CheckCircle, Wallet, Target } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

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
    let totalSales = 0;

    clients.forEach(c => {
      if (c.status === 'potential') potential++;
      if (c.status === 'confirmed') {
        confirmed++;
        totalSales += (c.advanceAmount || 0);
      }
      if (c.status === 'completed') {
        completed++;
        totalSales += (c.finalAmount || 0);
      }
    });

    return { potential, confirmed, completed, totalSales, totalClients: clients.length };
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

  if (isLoading) {
    return <div className="flex h-64 items-center justify-center animate-pulse text-primary font-bold">Loading metrics...</div>;
  }

  const statCards = [
    { title: 'Total Revenue', value: `₹${metrics.totalSales.toLocaleString()}`, icon: Wallet, color: 'text-green-500', bg: 'bg-green-500/10' },
    { title: 'Total Clients', value: metrics.totalClients, icon: Users, color: 'text-blue-500', bg: 'bg-blue-500/10' },
    { title: 'Active (Confirmed)', value: metrics.confirmed, icon: Target, color: 'text-purple-500', bg: 'bg-purple-500/10' },
    { title: 'Completed', value: metrics.completed, icon: CheckCircle, color: 'text-primary', bg: 'bg-primary/10' },
  ];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 flex flex-col pt-8 animate-in fade-in">
      <h1 className="text-3xl font-bold mb-4">Overview</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, i) => (
          <motion.div 
            key={i}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: i * 0.1 }}
            className="glass p-6 rounded-2xl flex items-center justify-between"
          >
            <div>
              <p className="text-sm font-medium opacity-70 mb-1">{stat.title}</p>
              <h3 className="text-3xl font-bold tracking-tight">{stat.value}</h3>
            </div>
            <div className={`p-4 rounded-xl ${stat.bg} ${stat.color}`}>
              <stat.icon size={28} />
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
              <Tooltip 
                contentStyle={{ borderRadius: '12px', border: '1px solid var(--border)', background: 'var(--card)' }}
                itemStyle={{ color: 'var(--foreground)' }}
              />
              <Line type="monotone" dataKey="sales" stroke="var(--primary)" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 8 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </motion.div>
  );
}
