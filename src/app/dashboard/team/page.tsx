'use client';

import { useWorkspaceStore } from '@/store/useWorkspaceStore';
import { useAuthStore } from '@/store/useAuthStore';
import { motion } from 'framer-motion';
import { UserPlus, Trash2, Shield, User, Copy, Check } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function TeamPage() {
  const { workspace, fetchWorkspace, generateInviteLink, removeMember, isLoading } = useWorkspaceStore();
  const { user } = useAuthStore();
  const [inviteLink, setInviteLink] = useState('');
  const [copied, setCopied] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

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

  const isOwner = user?._id === workspace?.ownerId?._id;

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Team Management</h1>
        <p className="text-[var(--text-muted)]">Manage your agency members and invitations.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Members List */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-sm font-semibold uppercase tracking-wider opacity-50">Members ({workspace?.members?.length || 0})</h2>
          <div className="glass border rounded-2xl overflow-hidden">
            <div className="divide-y divide-[var(--border)]">
              {workspace?.members?.map((member) => (
                <div key={member._id} className="p-4 flex items-center justify-between hover:bg-primary/5 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center overflow-hidden">
                      {member.avatar ? (
                        <img src={member.avatar} alt={member.name} className="w-full h-full object-cover" />
                      ) : (
                        <User size={20} className="text-primary" />
                      )}
                    </div>
                    <div>
                      <div className="font-medium flex items-center gap-2">
                        {member.name || member.email.split('@')[0]}
                        {member._id === workspace.ownerId._id && (
                          <span className="flex items-center gap-1 text-[10px] bg-amber-500/10 text-amber-500 px-1.5 py-0.5 rounded-md border border-amber-500/20 uppercase font-bold tracking-tighter">
                            <Shield size={10} /> Owner
                          </span>
                        )}
                        {member._id === user?._id && (
                          <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded-md border border-primary/20 uppercase font-bold tracking-tighter">You</span>
                        )}
                      </div>
                      <div className="text-xs text-[var(--text-muted)]">{member.email}</div>
                    </div>
                  </div>

                  {isOwner && member._id !== user?._id && (
                    <button
                      onClick={() => handleRemoveMember(member._id)}
                      className="p-2 text-red-500 hover:bg-red-500/10 rounded-xl transition-colors"
                      title="Remove Member"
                    >
                      <Trash2 size={18} />
                    </button>
                  )}
                </div>
              ))}
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
          </div>
        </div>
      </div>
    </div>
  );
}
