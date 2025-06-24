import { create } from 'zustand';
import { connectionApi } from '../services/api';

export interface Connection {
  id: string;
  name: string;
  igHandle?: string;
  igUrl?: string;
  metAt: string;
  metWhen: string;
  facts: string[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateConnectionInput {
  name: string;
  igHandle?: string;
  metAt: string;
  facts: string[];
}

interface ConnectionStore {
  connections: Connection[];
  loading: boolean;
  error: string | null;
  searchQuery: string;
  
  // Actions
  fetchConnections: () => Promise<void>;
  createConnection: (data: CreateConnectionInput) => Promise<void>;
  updateConnection: (id: string, data: Partial<CreateConnectionInput>) => Promise<void>;
  deleteConnection: (id: string) => Promise<void>;
  searchConnections: (query: string) => Promise<void>;
  setSearchQuery: (query: string) => void;
  clearError: () => void;
}

export const useConnectionStore = create<ConnectionStore>((set, get) => ({
  connections: [],
  loading: false,
  error: null,
  searchQuery: '',

  fetchConnections: async () => {
    set({ loading: true, error: null });
    try {
      const connections = await connectionApi.getAll();
      set({ connections, loading: false });
    } catch (error: any) {
      set({ 
        error: error.message || 'Failed to fetch connections', 
        loading: false 
      });
    }
  },

  createConnection: async (data: CreateConnectionInput) => {
    set({ loading: true, error: null });
    try {
      const newConnection = await connectionApi.create(data);
      set(state => ({ 
        connections: [newConnection, ...state.connections],
        loading: false 
      }));
    } catch (error: any) {
      set({ 
        error: error.message || 'Failed to create connection', 
        loading: false 
      });
      throw error;
    }
  },

  updateConnection: async (id: string, data: Partial<CreateConnectionInput>) => {
    set({ loading: true, error: null });
    try {
      const updatedConnection = await connectionApi.update(id, data);
      set(state => ({
        connections: state.connections.map(conn => 
          conn.id === id ? updatedConnection : conn
        ),
        loading: false
      }));
    } catch (error: any) {
      set({ 
        error: error.message || 'Failed to update connection', 
        loading: false 
      });
      throw error;
    }
  },

  deleteConnection: async (id: string) => {
    set({ loading: true, error: null });
    try {
      await connectionApi.delete(id);
      set(state => ({
        connections: state.connections.filter(conn => conn.id !== id),
        loading: false
      }));
    } catch (error: any) {
      set({ 
        error: error.message || 'Failed to delete connection', 
        loading: false 
      });
      throw error;
    }
  },

  searchConnections: async (query: string) => {
    if (!query.trim()) {
      get().fetchConnections();
      return;
    }
    
    set({ loading: true, error: null });
    try {
      const connections = await connectionApi.search(query);
      set({ connections, loading: false });
    } catch (error: any) {
      set({ 
        error: error.message || 'Failed to search connections', 
        loading: false 
      });
    }
  },

  setSearchQuery: (query: string) => {
    set({ searchQuery: query });
    if (query.trim()) {
      get().searchConnections(query);
    } else {
      get().fetchConnections();
    }
  },

  clearError: () => set({ error: null }),
})); 