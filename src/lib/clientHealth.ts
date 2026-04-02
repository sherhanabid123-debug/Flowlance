import { differenceInDays } from 'date-fns';
import { Activity, AlertTriangle, Snowflake, LucideIcon } from 'lucide-react';

export type HealthStatus = 'active' | 'at-risk' | 'cold';

export interface HealthInfo {
  status: HealthStatus;
  label: string;
  color: string;
  bg: string;
  icon: LucideIcon;
  description: string;
}

export function getClientHealthStatus(lastFollowUp: string | Date | undefined): HealthInfo {
  if (!lastFollowUp) {
    return {
      status: 'cold',
      label: 'Cold',
      color: 'text-red-500',
      bg: 'bg-red-500/10',
      icon: Snowflake,
      description: 'No recorded follow-up history.'
    };
  }

  const last = new Date(lastFollowUp);
  const today = new Date();
  const diffDays = Math.abs(differenceInDays(today, last));

  if (diffDays <= 2) {
    return {
      status: 'active',
      label: 'Active',
      color: 'text-emerald-500',
      bg: 'bg-emerald-500/10',
      icon: Activity,
      description: 'Great momentum! Contacted recently.'
    };
  }

  if (diffDays <= 5) {
    return {
      status: 'at-risk',
      label: 'At Risk',
      color: 'text-amber-500',
      bg: 'bg-amber-500/10',
      icon: AlertTriangle,
      description: 'Needs attention soon to stay engaged.'
    };
  }

  return {
    status: 'cold',
    label: 'Cold',
    color: 'text-red-500',
    bg: 'bg-red-500/10',
    icon: Snowflake,
    description: 'Highly at risk of drop-off. Needs urgent re-engagement.'
  };
}
