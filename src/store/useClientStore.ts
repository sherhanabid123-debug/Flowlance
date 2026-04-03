import { create } from 'zustand';

interface ClientState {
  clients: any[];
  isLoading: boolean;
  isHydrated: boolean;
  setClients: (clients: any[]) => void;
  fetchClients: (force?: boolean) => Promise<void>;
  addClient: (client: any) => void;
  updateClient: (client: any) => void;
  deleteClient: (id: string) => void;
  setLoading: (loading: boolean) => void;
  markFollowUpDone: (id: string, outcomeData?: { outcome: string, notes?: string, customNextDate?: string }) => Promise<void>;
}

export const useClientStore = create<ClientState>((set, get) => ({
  clients: [],
  isLoading: true,
  isHydrated: false,
  setClients: (clients) => set({ clients, isLoading: false, isHydrated: true }),
  fetchClients: async (force = false) => {
    if (get().isHydrated && !force) return;
    set({ isLoading: true });
    try {
      const res = await fetch('/api/clients');
      if (res.ok) {
        const data = await res.json();
        set({ clients: data.clients, isHydrated: true });
      }
    } catch (error) {
      console.error('Failed to fetch clients:', error);
    } finally {
      set({ isLoading: false });
    }
  },
  addClient: (client) => set((state) => ({ clients: [client, ...state.clients] })),
  updateClient: (updatedClient) => set((state) => ({
    clients: state.clients.map(c => c._id === updatedClient._id ? updatedClient : c)
  })),
  deleteClient: (id) => set((state) => ({
    clients: state.clients.filter(c => c._id !== id)
  })),
  setLoading: (isLoading) => set({ isLoading }),
  markFollowUpDone: async (id, outcomeData) => {
    try {
      const res = await fetch(`/api/clients/${id}/followup`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(outcomeData),
      });
      if (!res.ok) throw new Error('Failed to update follow-up');
      const { client } = await res.json();
      set((state) => ({
        clients: state.clients.map(c => c._id === id ? client : c)
      }));
    } catch (err) {
      console.error(err);
      throw err;
    }
  }
}));
