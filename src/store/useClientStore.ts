import { create } from 'zustand';

interface ClientState {
  clients: any[];
  isLoading: boolean;
  setClients: (clients: any[]) => void;
  addClient: (client: any) => void;
  updateClient: (client: any) => void;
  deleteClient: (id: string) => void;
  setLoading: (loading: boolean) => void;
}

export const useClientStore = create<ClientState>((set) => ({
  clients: [],
  isLoading: true,
  setClients: (clients) => set({ clients, isLoading: false }),
  addClient: (client) => set((state) => ({ clients: [client, ...state.clients] })),
  updateClient: (updatedClient) => set((state) => ({
    clients: state.clients.map(c => c._id === updatedClient._id ? updatedClient : c)
  })),
  deleteClient: (id) => set((state) => ({
    clients: state.clients.filter(c => c._id !== id)
  })),
  setLoading: (isLoading) => set({ isLoading }),
}));
