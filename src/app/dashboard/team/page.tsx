'use client';

import { useWorkspaceStore, WorkspaceRole } from '@/store/useWorkspaceStore';
import { useAuthStore } from '@/store/useAuthStore';
import { motion } from 'framer-motion';
import { UserPlus, Trash2, Shield, User, Copy, Check, ChevronDown } from 'lucide-react';
import { useState, useEffect, useMemo } from 'react';

export default function TeamPage() {
  const { workspace, fetchWorkspace, generateInviteLink, removeMember, updateMemberRole, isLoading } = useWorkspaceStore();
  const { user } = useAuthStore();
  const [inviteLink, setInviteLink] = useState('');
  const [copied, setCopied] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    fetchWorkspace();
    const interval = setInterval(fetchWorkspace, 30000); // Auto refresh every 30s
    return () => clearInterval(interval);
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

  // Safe checks for owner ID
  const ownerIdRaw = (workspace?.ownerId as any)?._id || workspace?.ownerId;
  const ownerIdStr = ownerIdRaw?.toString();
  const isOwner = user?._id?.toString() === ownerIdStr;

  // Robust member list: Even if owner isn't in the sub-collection, we show them
  const memberList = useMemo(() => {
    if (!workspace || !ownerIdStr) return [];
    
    // Start with existing members
    const list = [...(workspace.members || [])];
    
    // Check if owner is already in the list
    const isOwnerInList = list.some(m => {
      const mId = (m.userId as any)?._id || m.userId;
      return mId?.toString() === ownerIdStr;
    });
    
    if (!isOwnerInList) {
      // Add owner explicitly from ownerId data if they aren't listed
      const ownerName = (workspace.ownerId as any)?.name || 'Owner';
      const ownerEmail = (workspace.ownerId as any)?.email || '';
      const ownerAvatar = (workspace.ownerId as any)?.avatar;

      list.unshift({
        userId: {
          _id: ownerIdStr,
          name: ownerName,
          email: ownerEmail,
          avatar: ownerAvatar,
          userType: 'agency'
        } as any,
        role: 'owner'
      });
    }
    
    return list;
  }, [workspace, ownerIdStr]);

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-2 text-left">
        <h1 className="text-3xl font-bold tracking-tight">Team Management</h1>
        <p className="text-[var(--text-muted)]">Manage your agency members, roles, and invitations.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Members List */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-sm font-semibold uppercase tracking-wider opacity-50 text-left">Members ({memberList.length})</h2>
          <div className="glass border rounded-2xl overflow-hidden">
            <div className="divide-y divide-[var(--border)]">
              {memberList.map((member) => (
                <div key={((member.userId as any)?._id || member.userId)?.toString()} className="p-4 flex items-center justify-between hover:bg-primary/5 transition-colors">
                  <div className="flex items-center gap-4 text-left">
                    <div className="w-10 h-10 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center overflow-hidden">
                      {member.userId?.avatar ? (
                        <img src={member.userId.avatar} alt={member.userId.name} className="w-full h-full object-cover" />
                      ) : (
                        <User size={20} className="text-primary" />
                      )}
                    </div>
                    <div>
                      <div className="font-medium flex items-center gap-2">
                        {member.userId?.name || member.userId?.email?.split('@')[0] || 'Unknown Member'}
                        {member.role === 'owner' && (
                          <span className="flex items-center gap-1 text-[10px] bg-amber-500/10 text-amber-600 px-1.5 py-0.5 rounded-md border border-amber-500/20 uppercase font-bold tracking-tighter">
                            <Shield size={10} /> Owner
                          </span>
                        )}
                        {((member.userId as any)?._id || member.userId)?.toString() === user?._id?.toString() && (
                          <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded-md border border-primary/20 uppercase font-bold tracking-tighter">You</span>
                        )}
                      </div>
                      <div className="text-xs text-[var(--text-muted)]">{member.userId?.email}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {/* Role Selector or Badge */}
                    {isOwner && ((member.userId as any)?._id || member.userId)?.toString() !== user?._id?.toString() ? (
                      <div className="relative group">
                        <select
                          value={member.role}
                          onChange={(e) => handleRoleChange((member.userId as any)?._id || member.userId, e.target.value as WorkspaceRole)}
                          className={`appearance-none bg-primary/10 text-primary text-[11px] font-bold px-3 py-1.5 rounded-lg border border-primary/20 pr-8 focus:outline-none cursor-pointer transition-all ${
                            member.role === 'owner' ? 'bg-amber-500/10 text-amber-600 border-amber-500/20' : ''
                          }`}
                        >
                          <option value="member">MEMBER</option>
                          <option value="owner">OWNER</option>
                        </select>
                        <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none opacity-50" />
                      </div>
                    ) : (
                      <span className={`text-[11px] font-bold px-3 py-1.5 rounded-lg border ${
                        member.role === 'owner' ? 'bg-amber-500/10 text-amber-600 border-amber-500/20' : 'bg-primary/10 text-primary border-primary/20 invisible md:visible'
                      } uppercase transition-all whitespace-nowrap`}>
                        {member.role === 'owner' ? 'Owner' : 'Member'}
                      </span>
                    )}

                    {isOwner && ((member.userId as any)?._id || member.userId)?.toString() !== user?._id?.toString() && (
                      <button
                        onClick={() => handleRemoveMember((member.userId as any)?._id || member.userId)}
                        className="p-2 text-red-500 hover:bg-red-500/10 rounded-xl transition-colors shrink-0"
                        title="Remove Member"
                      >
                        <Trash2 size={18} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Invite Section */}
        <div className="space-y-4">
          <h2 className="text-sm font-semibold uppercase tracking-wider opacity-50 text-left">Add Team Member</h2>
          <div className="glass border rounded-3xl p-6 space-y-6">
            <div className="p-4 bg-primary/5 border border-primary/10 rounded-2xl text-left">
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
              <div className="flex items-center gap-2 text-[10px] text-[var(--text-muted)] bg-primary/5 p-3 rounded-xl text-left">
                 <Shield size={14} className="text-primary shrink-0" />
                 <p>Members can view all clients but cannot edit financial data or delete clients.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
