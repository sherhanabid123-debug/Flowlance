import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type WorkspaceRole = 'owner' | 'member';

interface WorkspaceMember {
  userId: {
    _id: string;
    name: string;
    email: string;
    avatar?: string;
    userType: string;
  };
  role: WorkspaceRole;
}

interface WorkspaceState {
  workspace: {
    _id: string;
    name: string;
    ownerId: {
      _id: string;
      name: string;
      email: string;
    };
    members: WorkspaceMember[];
  } | null;
  isLoading: boolean;
  fetchWorkspace: () => Promise<void>;
  generateInviteLink: () => Promise<string>;
  removeMember: (memberId: string) => Promise<void>;
  updateMemberRole: (memberId: string, role: WorkspaceRole) => Promise<void>;
  leaveWorkspace: () => Promise<void>;
  getCurrentRole: (userId: string | undefined) => WorkspaceRole;
}

export const useWorkspaceStore = create<WorkspaceState>()(
  persist(
    (set, get) => ({
      workspace: null,
      isLoading: false,
      fetchWorkspace: async () => {
        set({ isLoading: true });
        try {
          const res = await fetch('/api/workspaces');
          if (res.ok) {
            const data = await res.json();
            set({ workspace: data.workspace });
          }
        } catch (error) {
          console.error('Failed to fetch workspace:', error);
        } finally {
          set({ isLoading: false });
        }
      },
      generateInviteLink: async () => {
        try {
          const res = await fetch('/api/workspaces/invite', { method: 'POST' });
          if (!res.ok) throw new Error('Failed to generate link');
          const data = await res.json();
          return data.inviteLink;
        } catch (error) {
          console.error(error);
          throw error;
        }
      },
      removeMember: async (memberId: string) => {
        try {
          const res = await fetch(`/api/workspaces/members/${memberId}`, { method: 'DELETE' });
          if (!res.ok) {
            const data = await res.json();
            throw new Error(data.error || 'Failed to remove member');
          }
          await get().fetchWorkspace();
        } catch (error) {
          console.error(error);
          throw error;
        }
      },
      updateMemberRole: async (memberId: string, role: WorkspaceRole) => {
        try {
          const res = await fetch(`/api/workspaces/members/${memberId}/role`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ role }),
          });
          if (!res.ok) {
            const data = await res.json();
            throw new Error(data.error || 'Failed to update role');
          }
          await get().fetchWorkspace();
        } catch (error) {
          console.error(error);
          throw error;
        }
      },
      leaveWorkspace: async () => {
        try {
          const res = await fetch('/api/workspaces/members/leave', { method: 'DELETE' });
          if (!res.ok) {
            const data = await res.json();
            throw new Error(data.error || 'Failed to leave workspace');
          }
          set({ workspace: null });
        } catch (error) {
          console.error(error);
          throw error;
        }
      },
      getCurrentRole: (userId) => {
        if (!get().workspace || !userId) return 'member';
        const member = get().workspace?.members?.find(m => m.userId._id === userId);
        return member?.role || 'member';
      },
    }),
    {
      name: 'workspace-storage',
    }
  )
);
