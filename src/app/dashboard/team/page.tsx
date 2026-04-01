'use client';

import { useWorkspaceStore, WorkspaceRole } from '@/store/useWorkspaceStore';
import { useAuthStore } from '@/store/useAuthStore';
import { motion } from 'framer-motion';
import { UserPlus, Trash2, Shield, User, Copy, Check, ChevronDown, AlertTriangle, LogOut, Loader2 } from 'lucide-react';
import { useState, useEffect, useMemo } from 'react';
import { useToastStore } from '@/store/useToastStore';

export default function TeamPage() {
  const { workspace, fetchWorkspace, generateInviteLink, removeMember, updateMemberRole, leaveWorkspace, joinWorkspace, isLoading } = useWorkspaceStore();
  const [isLeaving, setIsLeaving] = useState(false);
  const { user } = useAuthStore();
  const { addToast } = useToastStore();
  const [inviteLink, setInviteLink] = useState('');
  const [pastedInvite, setPastedInvite] = useState('');
  const [copied, setCopied] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isJoining, setIsJoining] = useState(false);

  useEffect(() => {
    fetchWorkspace();
  }, [fetchWorkspace]);

  const handleGenerateInvite = async () => {
    setIsGenerating(true);
    try {
      const link = await generateInviteLink();
      setInviteLink(link);
    } catch (error) {
      alert('Failed to generate invite link');
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(inviteLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRemoveMember = async (memberId: string) => {
    if (confirm('Are you sure you want to remove this member?')) {
      try {
        await removeMember(memberId);
      } catch (error: any) {
        alert(error.message);
      }
    }
  };

  const handleRoleChange = async (memberId: string, role: WorkspaceRole) => {
    try {
      await updateMemberRole(memberId, role);
    } catch (error: any) {
      alert(error.message);
    }
  };

  const isOwner = user?._id === workspace?.ownerId?._id;

  const handleLeaveWorkspace = async () => {
    if (!confirm('Are you sure you want to leave this workspace? You will lose access to all shared clients and data.')) return;
    setIsLeaving(true);
    try {
      await leaveWorkspace();
      window.location.href = '/dashboard';
    } catch (error: any) {
      alert(error.message);
      setIsLeaving(false);
    }
  };

  const handleJoinWorkspace = async () => {
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
  };

  // Filter out invalid members (those without a populated userId)
  const validMembers = useMemo(() => {
    return workspace?.members?.filter(m => m.userId && typeof m.userId === 'object' && m.userId._id) || [];
  }, [workspace?.members]);

  const ghostMemberCount = (workspace?.members?.length || 0) - validMembers.length;

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Team Management</h1>
          <p className="text-[var(--text-muted)]">Manage your agency members, roles, and invitations.</p>
        </div>
        {!isOwner && (
          <button
            onClick={handleLeaveWorkspace}
            disabled={isLeaving}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm text-red-500 border border-red-500/30 hover:bg-red-500/10 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
          >
            <LogOut size={16} />
            {isLeaving ? 'Leaving...' : 'Leave Team'}
          </button>
        )}
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
              {validMembers.map((member) => (
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
                      <div className="text-xs text-[var(--text-muted)]">{member.userId.email || 'No Email'}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {/* Role Selector */}
                    <div className="relative group">
                      <select
                        value={member.role}
                        disabled={!isOwner || member.userId._id === user?._id}
                        onChange={(e) => handleRoleChange(member.userId._id, e.target.value as WorkspaceRole)}
                        className={`appearance-none bg-primary/10 text-primary text-[11px] font-bold px-3 py-1.5 rounded-lg border border-primary/20 pr-8 focus:outline-none cursor-pointer disabled:cursor-not-allowed disabled:opacity-80 transition-all ${
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
                        className="p-2 text-red-500 hover:bg-red-500/10 rounded-xl transition-colors"
                        title="Remove Member"
                      >
                        <Trash2 size={18} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
              
              {validMembers.length === 0 && !isLoading && (
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
