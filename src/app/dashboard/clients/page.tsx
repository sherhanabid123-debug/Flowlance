'use client';

import { useState, useEffect } from 'react';
import { useClientStore } from '@/store/useClientStore';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Plus, Trash2, Edit, Link as LinkIcon } from 'lucide-react';
import { ClientModal } from '@/components/ui/ClientModal';
import { useToastStore } from '@/store/useToastStore';

export default function ClientsPage() {
  const { clients, setClients, isLoading, setLoading, deleteClient } = useClientStore();
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<any>(null);
  const { addToast } = useToastStore();
  
  useEffect(() => {
    const fetchClients = async () => {
      try {
        const res = await fetch('/api/clients');
        const data = await res.json();
        setClients(data.clients || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchClients();
  }, [setClients, setLoading]);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this client?')) return;
    try {
      const res = await fetch(`/api/clients/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete');
      deleteClient(id);
      addToast('Client deleted successfully', 'info');
    } catch (e) {
      addToast('Error deleting client', 'error');
    }
  };

  const handleEdit = (client: any) => {
    setEditingClient(client);
    setIsModalOpen(true);
  };

  const handleUpgradeStatus = (client: any, newStatus: string) => {
    // Open the modal, pre-loaded with the client's information but targeted to the new status.
    // This forces the user to fill out the newly required fields (e.g. advance amount) for that stage before saving.
    setEditingClient({ ...client, status: newStatus });
    setIsModalOpen(true);
  };

  const handleAddNew = () => {
    setEditingClient(null);
    setIsModalOpen(true);
  };

  const filteredClients = clients.filter(c => 
    (filter === 'all' || c.status === filter) && 
    (c.name.toLowerCase().includes(search.toLowerCase()) || c.projectName.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="pt-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <h1 className="text-3xl font-bold tracking-tight">Client Management</h1>
        <button onClick={handleAddNew} className="flex items-center gap-2 bg-primary text-primary-foreground px-5 py-2.5 rounded-xl font-medium hover:opacity-90 transition-opacity whitespace-nowrap">
          <Plus size={18} /> New Client
        </button>
      </div>

      <div className="glass rounded-2xl p-4 md:p-6 mb-8 flex flex-col md:flex-row gap-4 justify-between items-center z-10 sticky top-[68px]">
        <div className="flex space-x-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
          {['all', 'potential', 'confirmed', 'completed'].map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-4 py-2 rounded-lg font-medium capitalize whitespace-nowrap transition-colors ${
                filter === tab ? 'bg-primary text-white shadow-md' : 'hover:bg-black/5 dark:hover:bg-white/10'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
        
        <div className="relative w-full md:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 opacity-50" size={18} />
          <input
            type="text"
            placeholder="Search clients..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-background border outline-none focus:ring-2 focus:ring-primary transition-all"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        <AnimatePresence>
          {isLoading && <p className="text-center opacity-70 p-8">Loading clients...</p>}
          {!isLoading && filteredClients.length === 0 && (
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center opacity-70 p-8">
              No clients found in this category.
            </motion.p>
          )}
          {filteredClients.map((client, i) => (
            <motion.div
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ delay: i * 0.05 }}
              key={client._id}
              className="glass p-5 rounded-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:border-primary/50 transition-colors"
            >
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold text-lg">{client.name}</h3>
                  {filter === 'all' && (
                    <span className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full font-bold bg-opacity-20 ${
                      client.status === 'completed' ? 'bg-green-500 text-green-600' : 
                      client.status === 'confirmed' ? 'bg-purple-500 text-purple-600' : 
                      'bg-blue-500 text-blue-600'
                    }`}>
                      {client.status}
                    </span>
                  )}
                </div>
                <p className="text-sm opacity-70">{client.projectName}</p>
                {(filter === 'potential' || (filter === 'all' && client.status === 'potential')) && <p className="text-xs font-semibold text-blue-500 mt-1">Budget: ₹{client.expectedBudget}</p>}
                {(filter === 'confirmed' || (filter === 'all' && client.status === 'confirmed')) && <p className="text-xs font-semibold text-purple-500 mt-1">Advance: ₹{client.advanceAmount}</p>}
                {(filter === 'completed' || (filter === 'all' && client.status === 'completed')) && <p className="text-xs font-semibold text-green-500 mt-1">Final: ₹{client.finalAmount}</p>}
                
                {client.sampleProvided && client.sampleLink && (
                  <a 
                    href={client.sampleLink} 
                    target="_blank" 
                    rel="noreferrer" 
                    className="inline-flex items-center gap-1.5 mt-3 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors bg-blue-500/10 hover:bg-blue-500/20 px-2.5 py-1 rounded-md"
                  >
                    <LinkIcon size={12} /> View Sample
                  </a>
                )}
              </div>
              
              <div className="flex items-center gap-3">
                {client.status === 'potential' && (
                  <button 
                    onClick={() => handleUpgradeStatus(client, 'confirmed')}
                    className="text-xs font-bold px-3 py-1.5 bg-purple-500/10 text-purple-600 dark:text-purple-400 rounded-lg hover:bg-purple-500/20 transition-colors"
                  >
                    Confirm Project
                  </button>
                )}
                {client.status === 'confirmed' && (
                  <button 
                    onClick={() => handleUpgradeStatus(client, 'completed')}
                    className="text-xs font-bold px-3 py-1.5 bg-green-500/10 text-green-600 dark:text-green-400 rounded-lg hover:bg-green-500/20 transition-colors"
                  >
                    Mark Completed
                  </button>
                )}

                <div className="flex space-x-1 sm:pl-3 sm:border-l sm:border-[var(--border)]">
                  <button 
                    onClick={() => handleEdit(client)}
                    className="p-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 text-primary transition-colors"
                    title="Edit Client"
                  >
                    <Edit size={18} />
                  </button>
                  <button 
                    onClick={() => handleDelete(client._id)} 
                    className="p-2 rounded-lg hover:bg-destructive/10 text-destructive transition-colors"
                    title="Delete Client"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
      
      <ClientModal 
        isOpen={isModalOpen} 
        onClose={() => {
          setIsModalOpen(false);
          setEditingClient(null);
        }} 
        initialData={editingClient}
      />
    </div>
  );
}
