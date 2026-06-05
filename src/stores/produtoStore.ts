'use client';
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { Produto } from '../types';
import { MOCK_PRODUTOS } from '../lib/mockData';
import { gerarId, agora } from '../lib/utils';

interface ProdutoState {
  produtos: Produto[];
  fetchProdutos: () => Promise<void>;
  addProduto: (data: Omit<Produto, 'id' | 'created_at' | 'updated_at'>) => Promise<Produto>;
  updateProduto: (id: string, data: Partial<Produto>) => Promise<void>;
  deleteProduto: (id: string) => Promise<void>;
  getProduto: (id: string) => Produto | undefined;
}

export const useProdutoStore = create<ProdutoState>()(
  persist(
    (set, get) => ({
      produtos: MOCK_PRODUTOS,
      fetchProdutos: async () => {
        try {
          const res = await fetch('/api/produtos');
          if (res.ok) set({ produtos: await res.json() });
        } catch {}
      },
      addProduto: async (data) => {
        // Optimistic local update
        const local: Produto = { ...data, id: gerarId(), created_at: agora(), updated_at: agora() };
        set(s => ({ produtos: [...s.produtos, local] }));
        try {
          const res = await fetch('/api/produtos', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
          if (res.ok) {
            const p = await res.json();
            set(s => ({ produtos: s.produtos.map(x => x.id === local.id ? p : x) }));
            return p;
          }
        } catch {}
        return local;
      },
      updateProduto: async (id, data) => {
        set(s => ({ produtos: s.produtos.map(p => p.id === id ? { ...p, ...data, updated_at: agora() } : p) }));
        try {
          const res = await fetch(`/api/produtos/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
          if (res.ok) {
            const p = await res.json();
            set(s => ({ produtos: s.produtos.map(x => x.id === id ? p : x) }));
          }
        } catch {}
      },
      deleteProduto: async (id) => {
        set(s => ({ produtos: s.produtos.filter(p => p.id !== id) }));
        try { await fetch(`/api/produtos/${id}`, { method: 'DELETE' }); } catch {}
      },
      getProduto: (id) => get().produtos.find(p => p.id === id),
    }),
    { name: 'seareiros-produtos', storage: createJSONStorage(() => localStorage) }
  )
);
