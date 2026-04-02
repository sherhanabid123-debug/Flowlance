import { isPast, isToday, differenceInDays } from 'date-fns';
import { AlertCircle, Snowflake, Star, Zap, CheckCircle2, LucideIcon } from 'lucide-react';
import { getClientHealthStatus } from './clientHealth';

export interface Insight {
  id: string;
  type: 'critical' | 'warning' | 'opportunity' | 'info' | 'success';
  icon: LucideIcon;
  label: string;
  count: number;
  description: string;
  color: string;
  bg: string;
}

export function generateDashboardInsights(clients: any[]): Insight[] {
  const insights: Insight[] = [];
  const today = new Date();

  // 1. Overdue Follow-ups (Critical)
  const overdue = clients.filter(c => 
    c.status !== 'completed' && 
    c.nextFollowUp && 
    isPast(new Date(c.nextFollowUp)) && 
    !isToday(new Date(c.nextFollowUp))
  );
  if (overdue.length > 0) {
    insights.push({
      id: 'overdue',
      type: 'critical',
      icon: AlertCircle,
      label: 'Immediate Action',
      count: overdue.length,
      description: `${overdue.length} client${overdue.length > 1 ? 's' : ''} missed their follow-up date.`,
      color: 'text-red-500',
      bg: 'bg-red-500/10'
    });
  }

  // 2. Cold Leads (Warning)
  const cold = clients.filter(c => 
    c.status !== 'completed' && 
    getClientHealthStatus(c.lastFollowUp).status === 'cold'
  );
  if (cold.length > 0) {
    insights.push({
      id: 'cold',
      type: 'warning',
      icon: Snowflake,
      label: 'Cold Pipeline',
      count: cold.length,
      description: `${cold.length} prospect${cold.length > 1 ? 's haven\'t' : ' hasn\'t'} been contacted in over 5 days.`,
      color: 'text-blue-500',
      bg: 'bg-blue-500/10'
    });
  }

  // 3. High-Value Opportunities (Opportunity)
  const luxuryLeads = clients.filter(c => 
    c.status === 'potential' && 
    (c.expectedBudget || 0) >= 10000 &&
    (!c.lastFollowUp || Math.abs(differenceInDays(today, new Date(c.lastFollowUp))) >= 3)
  );
  if (luxuryLeads.length > 0) {
    insights.push({
      id: 'high-value',
      type: 'opportunity',
      icon: Star,
      label: 'Luxury Leads',
      count: luxuryLeads.length,
      description: `${luxuryLeads.length} high-budget client${luxuryLeads.length > 1 ? 's' : ''} need a fresh touch-point.`,
      color: 'text-amber-500',
      bg: 'bg-amber-500/10'
    });
  }

  // 4. Sample Follow-ups (Info)
  const sampleFollowups = clients.filter(c => 
    c.status !== 'completed' && 
    c.sampleProvided && 
    (!c.lastFollowUp || Math.abs(differenceInDays(today, new Date(c.lastFollowUp))) >= 2)
  );
  if (sampleFollowups.length > 0) {
    insights.push({
      id: 'sample-followup',
      type: 'info',
      icon: Zap,
      label: 'Sample Momentum',
      count: sampleFollowups.length,
      description: `${sampleFollowups.length} client${sampleFollowups.length > 1 ? 's' : ''} received samples but no check-in yet.`,
      color: 'text-indigo-500',
      bg: 'bg-indigo-500/10'
    });
  }

  // 5. Success State (If nothing else)
  if (insights.length === 0) {
    insights.push({
      id: 'all-clear',
      type: 'success',
      icon: CheckCircle2,
      label: 'Peak Efficiency',
      count: 0,
      description: 'Your pipeline is in perfect health. Stay consistent! 🚀',
      color: 'text-emerald-500',
      bg: 'bg-emerald-500/10'
    });
  }

  return insights;
}
