'use client';

import { useWorkspaceStore, WorkspaceRole } from '@/store/useWorkspaceStore';
import { useAuthStore } from '@/store/useAuthStore';
import { useClientStore } from '@/store/useClientStore';
import { motion, AnimatePresence } from 'framer-motion';
import { UserPlus, Trash2, Shield, User, Copy, Check, ChevronDown, AlertTriangle, LogOut, Loader2, Wallet, Users, TrendingUp, PiggyBank, IndianRupee } from 'lucide-react';
import { useState, useEffect, useMemo } from 'react';
import { useToastStore } from '@/store/useToastStore';
import { useAuthBarrier } from '@/hooks/useAuthBarrier';

export default function TeamPage() {
  const { workspace: realWorkspace, fetchWorkspace, generateInviteLink, removeMember, updateMemberRole, leaveWorkspace, joinWorkspace, isLoading: isWorkspaceLoading } = useWorkspaceStore();
  const { clients, setClients, isLoading: isClientsLoading } = useClientStore();
  const [isLeaving, setIsLeaving] = useState(false);
  const { user } = useAuthStore();
  const { addToast } = useToastStore();
  const [inviteLink, setInviteLink] = useState('');
  const [pastedInvite, setPastedInvite] = useState('');
  const [copied, setCopied] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isJoining, setIsJoining] = useState(false);

  const { runProtected, isAuthenticated } = useAuthBarrier();

  // Use the real workspace data
  const workspace = realWorkspace;

  useEffect(() => {
    if (!isAuthenticated) return;
    
    fetchWorkspace();
    
    const fetchClients = async () => {
      try {
        const res = await fetch('/api/clients');
        if (res.ok) {
          const data = await res.json();
          setClients(data.clients);
        }
      } catch (error) {
        console.error('Failed to fetch clients:', error);
      }
    };
    fetchClients();
  }, [fetchWorkspace, setClients, isAuthenticated]);

  const handleGenerateInvite = async () => {
    runProtected(async () => {
      setIsGenerating(true);
      try {
        const link = await generateInviteLink();
        setInviteLink(link);
      } catch (error) {
        alert('Failed to generate invite link');
      } finally {
        setIsGenerating(false);
      }
    });
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(inviteLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRemoveMember = async (memberId: string) => {
    runProtected(async () => {
      if (confirm('Are you sure you want to remove this member?')) {
        try {
          await removeMember(memberId);
        } catch (error: any) {
          alert(error.message);
        }
      }
    });
  };

  const handleRoleChange = async (memberId: string, role: WorkspaceRole) => {
    runProtected(async () => {
      try {
        await updateMemberRole(memberId, role);
      } catch (error: any) {
        alert(error.message);
      }
    });
  };

  const handleLeaveWorkspace = async () => {
    runProtected(async () => {
      if (!confirm('Are you sure you want to leave this workspace? You will lose access to all shared clients and data.')) return;
      setIsLeaving(true);
      try {
        await leaveWorkspace();
        window.location.href = '/dashboard';
      } catch (error: any) {
        alert(error.message);
        setIsLeaving(false);
      }
    });
  };
  const handleJoinWorkspace = async () => {
    runProtected(async () => {
      if (!pastedInvite.trim()) return;
      setIsJoining(true);
      try {
        const workspaceName = await joinWorkspace(pastedInvite);
        addToast(`Successfully joined "${workspaceName}" team!`, 'success');
        setPastedInvite('');
      } catch (error: any) {
        addToast(error.message || 'Failed to join workspace', 'error');
      } finally {
        setIsJoining(false);
      }
    });
  };

  // Filter out invalid members (those without a populated userId)
  const validMembers = useMemo(() => {
    return workspace?.members?.filter(m => m.userId && typeof m.userId === 'object' && m.userId._id) || [];
  }, [workspace?.members]);

  const ghostMemberCount = (workspace?.members?.length || 0) - validMembers.length;
  
  const isOwner = isAuthenticated ? (user?._id === workspace?.ownerId?._id) : false;

  // Finance Analytics
  const teamFinances = useMemo(() => {
    const completedClients = clients.filter(c => c.status === 'completed');
    const totalAgencyRevenue = completedClients.reduce((sum, c) => sum + (c.finalAmount || 0), 0);
    
    // Earnings per member
    const earningsMap: Record<string, number> = {};
    validMembers.forEach(m => earningsMap[m.userId._id] = 0);

    completedClients.forEach(c => {
      if (c.shares && c.shares.length > 0) {
        c.shares.forEach((s: any) => {
          const uId = (s.userId._id || s.userId).toString();
          if (earningsMap[uId] !== undefined) {
             earningsMap[uId] += (c.finalAmount * s.percentage) / 100;
          }
        });
      } else if (workspace?.ownerId) {
        // Default to owner if no shares defined
        const oId = (workspace.ownerId as any)._id || workspace.ownerId;
        if (earningsMap[oId] !== undefined) {
          earningsMap[oId] += (c.finalAmount || 0);
        }
      }
    });

    // Total payouts are distributions to OTHER team members (excluding the current user)
    const myId = user?._id || '';
    const totalPayouts = Object.entries(earningsMap).reduce((sum, [uId, amount]) => {
      return sum + (uId === myId ? 0 : amount);
    }, 0);

    return { totalAgencyRevenue, totalPayouts, earningsMap };
  }, [clients, validMembers, workspace?.ownerId, user?._id]);

  const stats = [
    { label: 'Agency Revenue', value: `₹${teamFinances.totalAgencyRevenue.toLocaleString('en-IN')}`, icon: Wallet, color: 'text-green-500' },
    { label: 'Team Payouts', value: `₹${teamFinances.totalPayouts.toLocaleString('en-IN')}`, icon: TrendingUp, color: 'text-blue-500' },
    { label: 'Your Share', value: `₹${(teamFinances.earningsMap[user?._id || ''] || 0).toLocaleString('en-IN')}`, icon: PiggyBank, color: 'text-indigo-500' },
  ];

  return (
    <div className="space-y-8 relative pt-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Team Management</h1>
          <p className="text-xs sm:text-sm text-[var(--text-muted)]">Manage your agency members, roles, and invitations.</p>
        </div>
        {!isOwner && (
          <button
            onClick={handleLeaveWorkspace}
            disabled={isLeaving}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm text-red-500 border border-red-500/30 hover:bg-red-500/10 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
          >
            <LogOut size={16} />
            {isLeaving ? 'Leaving...' : 'Leave Team'}
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {stats.map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="glass border rounded-2xl sm:rounded-3xl p-4 sm:p-6 flex items-center gap-4 relative overflow-hidden group hover:border-primary/30 transition-all"
          >
            <div className={`p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-black/5 dark:bg-white/5 ${stat.color}`}>
              <stat.icon size={20} className="sm:size-6" />
            </div>
            <div>
              <p className="text-[10px] font-bold opacity-40 uppercase tracking-widest">{stat.label}</p>
              <p className="text-xl sm:text-2xl font-bold tracking-tight">{stat.value}</p>
            </div>
            <div className="absolute -right-4 -bottom-4 opacity-[0.03] group-hover:opacity-[0.07] transition-opacity">
              <stat.icon size={80} className="sm:size-[100px]" />
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Members List */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-wider opacity-50">Members ({validMembers.length})</h2>
            {ghostMemberCount > 0 && (
              <div className="flex items-center gap-1.5 text-[10px] bg-red-500/10 text-red-500 px-2 py-1 rounded-lg border border-red-500/20 font-bold uppercase tracking-tighter">
                <AlertTriangle size={12} /> {ghostMemberCount} Sync Errors
              </div>
            )}
          </div>
          
          <div className="glass border rounded-2xl overflow-hidden">
            <div className="divide-y divide-[var(--border)]">
              {validMembers.map((member: any) => (
                <div key={member.userId._id} className="p-4 flex items-center justify-between hover:bg-primary/5 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center overflow-hidden">
                      {member.userId.avatar ? (
                        <img src={member.userId.avatar} alt={member.userId.name} className="w-full h-full object-cover" />
                      ) : (
                        <User size={20} className="text-primary" />
                      )}
                    </div>
                    <div>
                      <div className="font-medium flex items-center gap-2">
                        {member.userId.name || member.userId.email?.split('@')[0] || 'Unknown User'}
                        {member.userId._id === user?._id && (
                          <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded-md border border-primary/20 uppercase font-bold tracking-tighter">You</span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-[var(--text-muted)]">
                        {member.userId.email || 'No Email'}
                        <span className="opacity-30">•</span>
                        <div className="flex items-center gap-1 text-primary font-bold">
                           <IndianRupee size={10} />
                           {teamFinances.earningsMap[member.userId._id]?.toLocaleString('en-IN') || 0}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center gap-3 w-full sm:w-auto">
                    {/* Role Selector */}
                    <div className="relative group w-full sm:w-auto">
                      <select
                        value={member.role}
                        disabled={!isOwner || member.userId._id === user?._id}
                        onChange={(e) => handleRoleChange(member.userId._id, e.target.value as WorkspaceRole)}
                        className={`w-full appearance-none bg-primary/10 text-primary text-[11px] font-bold px-3 py-2 sm:py-1.5 rounded-lg border border-primary/20 pr-8 focus:outline-none cursor-pointer disabled:cursor-not-allowed disabled:opacity-80 transition-all ${
                          member.role === 'owner' ? 'bg-amber-500/10 text-amber-600 border-amber-500/20' : ''
                        }`}
                      >
                        <option value="member">MEMBER</option>
                        <option value="owner">OWNER</option>
                      </select>
                      <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none opacity-50" />
                    </div>
 
                    {isOwner && member.userId._id !== user?._id && (
                      <button
                        onClick={() => handleRemoveMember(member.userId._id)}
                        className="flex items-center justify-center gap-2 w-full sm:w-auto p-2 text-red-500 hover:bg-red-500/10 rounded-xl transition-colors border border-red-500/10 sm:border-none"
                        title="Remove Member"
                      >
                        <Trash2 size={18} />
                        <span className="sm:hidden text-xs font-bold uppercase">Remove</span>
                      </button>
                    )}
                  </div>
                </div>
              ))}
              
              {validMembers.length === 0 && !isWorkspaceLoading && (
                <div className="p-12 text-center opacity-40 italic text-sm">
                   No team members found.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Invite Section */}
        <div className="space-y-4">
          <h2 className="text-sm font-semibold uppercase tracking-wider opacity-50">Add Team Member</h2>
          <div className="glass border rounded-3xl p-6 space-y-6">
            <div className="p-4 bg-primary/5 border border-primary/10 rounded-2xl">
              <div className="flex items-start gap-4">
                <div className="p-2 bg-primary/10 rounded-xl text-primary mt-1">
                  <UserPlus size={20} />
                </div>
                <div className="space-y-1">
                  <h3 className="font-semibold text-sm">Invite with a link</h3>
                  <p className="text-xs text-[var(--text-muted)]">Anyone with this unique link can join your agency workspace.</p>
                </div>
              </div>
            </div>

            {!inviteLink ? (
              <button
                onClick={handleGenerateInvite}
                disabled={!isOwner || isGenerating}
                className="w-full h-12 bg-primary text-white font-bold rounded-2xl hover:opacity-90 transition-all shadow-lg active:scale-95 disabled:opacity-50 disabled:grayscale disabled:scale-100"
              >
                {isGenerating ? 'Generating...' : 'Generate Invite Link'}
              </button>
            ) : (
              <div className="space-y-3">
                <div className="relative group">
                  <input
                    type="text"
                    readOnly
                    value={inviteLink}
                    className="w-full h-12 bg-[var(--background)]/50 border border-[var(--border)] rounded-2xl px-4 text-xs font-mono pr-12 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                  />
                  <button
                    onClick={copyToClipboard}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-2 hover:bg-primary/10 rounded-xl text-primary transition-all active:scale-90"
                  >
                    {copied ? <Check size={18} /> : <Copy size={18} />}
                  </button>
                </div>
                <p className="text-[10px] text-center text-amber-500 font-medium italic">
                  Link expires in 7 days. Only share with people you trust.
                </p>
                <button
                   onClick={() => setInviteLink('')}
                   className="w-full text-xs font-bold text-primary hover:underline"
                >
                  Clear Link
                </button>
              </div>
            )}

            {!isOwner && (
              <p className="text-[10px] text-red-500 italic text-center font-medium">
                * Only the workspace owner can generate invite links.
              </p>
            )}

            <div className="pt-4 border-t border-[var(--border)]">
              <div className="flex items-center gap-2 text-[10px] text-[var(--text-muted)] bg-primary/5 p-3 rounded-xl">
                 <Shield size={14} className="text-primary shrink-0" />
                 <p>Members can view all clients but cannot edit financial data or delete clients.</p>
              </div>
            </div>
          </div>

          <h2 className="text-sm font-semibold uppercase tracking-wider opacity-50 pt-4">Join a Workspace</h2>
          <div className="glass border border-indigo-500/20 rounded-3xl p-6 space-y-4">
            <div className="space-y-1">
              <h3 className="font-semibold text-sm">Have an invite link?</h3>
              <p className="text-xs text-[var(--text-muted)]">Paste the link or token below to join a new team.</p>
            </div>
            
            <div className="relative group">
              <input
                type="text"
                value={pastedInvite}
                onChange={(e) => setPastedInvite(e.target.value)}
                placeholder="Paste link here..."
                className="w-full h-12 bg-indigo-500/5 border border-indigo-500/20 rounded-2xl px-4 text-xs pr-12 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all font-mono"
              />
              <UserPlus size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-indigo-500 opacity-40 shrink-0" />
            </div>

            <button
              onClick={handleJoinWorkspace}
              disabled={isJoining || !pastedInvite.trim()}
              className="w-full h-12 bg-indigo-600 text-white font-bold rounded-2xl hover:bg-indigo-700 transition-all shadow-lg active:scale-95 disabled:opacity-50 disabled:grayscale disabled:scale-100 flex items-center justify-center gap-2"
            >
              {isJoining ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <>
                  <Check size={18} />
                  Join Team
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
