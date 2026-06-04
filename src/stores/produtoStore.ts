'use client';
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { Produto } from '../types';
import { MOCK_PRODUTOS } from '../lib/mockData';
import { gerarId, agora } from '../lib/utils';

interface ProdutoState {
  produtos: Produto[];
  addProduto: (data: Omit<Produto, 'id' | 'created_at' | 'updated_at'>) => Produto;
  updateProduto: (id: string, data: Partial<Produto>) => void;
  deleteProduto: (id: string) => void;
  getProduto: (id: string) => Produto | undefined;
}

export const useProdutoStore = create<ProdutoState>()(
  persist(
    (set, get) => ({
      produtos: MOCK_PRODUTOS,
      addProduto: (data) => {
        const p: Produto = { ...data, id: gerarId(), created_at: agora(), updated_at: agora() };
        set(s => ({ produtos: [...s.produtos, p] }));
        return p;
      },
      updateProduto: (id, data) =>
        set(s => ({ produtos: s.produtos.map(p => p.id === id ? { ...p, ...data, updated_at: agora() } : p) })),
      deleteProduto: (id) => set(s => ({ produtos: s.produtos.filter(p => p.id !== id) })),
      getProduto: (id) => get().produtos.find(p => p.id === id),
    }),
    { name: 'seareiros-produtos', storage: createJSONStorage(() => localStorage) }
  )
);
