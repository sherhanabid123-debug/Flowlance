import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface WorkspaceMember {
  _id: string;
  name: string;
  email: string;
  avatar?: string;
  userType: string;
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
          // Refresh workspace data
          await get().fetchWorkspace();
        } catch (error) {
          console.error(error);
          throw error;
        }
      },
    }),
    {
      name: 'workspace-storage',
    }
  )
);
