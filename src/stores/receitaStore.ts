'use client';
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { Receita, ReceitaIngrediente } from '../types';
import { MOCK_RECEITAS } from '../lib/mockData';
import { gerarId, agora } from '../lib/utils';

interface ReceitaState {
  receitas: Receita[];
  fetchReceitas: () => Promise<void>;
  addReceita: (data: Omit<Receita, 'id' | 'created_at' | 'updated_at'>) => Promise<Receita>;
  updateReceita: (id: string, data: Partial<Receita>) => Promise<void>;
  deleteReceita: (id: string) => Promise<void>;
  getReceita: (id: string) => Receita | undefined;
  addIngrediente: (receitaId: string, ing: Omit<ReceitaIngrediente, 'id'>) => Promise<void>;
  removeIngrediente: (receitaId: string, ingId: string) => Promise<void>;
}

export const useReceitaStore = create<ReceitaState>()(
  persist(
    (set, get) => ({
      receitas: MOCK_RECEITAS,
      fetchReceitas: async () => {
        try {
          const res = await fetch('/api/receitas');
          if (res.ok) set({ receitas: await res.json() });
        } catch {}
      },
      addReceita: async (data) => {
        const local: Receita = { ...data, id: gerarId(), created_at: agora(), updated_at: agora() };
        set(s => ({ receitas: [...s.receitas, local] }));
        try {
          const res = await fetch('/api/receitas', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
          if (res.ok) {
            const r = await res.json();
            set(s => ({ receitas: s.receitas.map(x => x.id === local.id ? r : x) }));
            return r;
          }
        } catch {}
        return local;
      },
      updateReceita: async (id, data) => {
        set(s => ({ receitas: s.receitas.map(r => r.id === id ? { ...r, ...data, updated_at: agora() } : r) }));
        try {
          const res = await fetch(`/api/receitas/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
          if (res.ok) {
            const r = await res.json();
            set(s => ({ receitas: s.receitas.map(x => x.id === id ? r : x) }));
          }
        } catch {}
      },
      deleteReceita: async (id) => {
        set(s => ({ receitas: s.receitas.filter(r => r.id !== id) }));
        try { await fetch(`/api/receitas/${id}`, { method: 'DELETE' }); } catch {}
      },
      getReceita: (id) => get().receitas.find(r => r.id === id),
      addIngrediente: async (receitaId, ing) => {
        const newIng = { ...ing, id: gerarId() };
        set(s => ({
          receitas: s.receitas.map(r => r.id === receitaId
            ? { ...r, ingredientes: [...(r.ingredientes || []), newIng], updated_at: agora() } : r),
        }));
        // Full recipe update via API
        const r = get().receitas.find(x => x.id === receitaId);
        if (r) {
          try {
            await fetch(`/api/receitas/${receitaId}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(r) });
          } catch {}
        }
      },
      removeIngrediente: async (receitaId, ingId) => {
        set(s => ({
          receitas: s.receitas.map(r => r.id === receitaId
            ? { ...r, ingredientes: (r.ingredientes || []).filter(i => i.id !== ingId), updated_at: agora() } : r),
        }));
        const r = get().receitas.find(x => x.id === receitaId);
        if (r) {
          try {
            await fetch(`/api/receitas/${receitaId}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(r) });
          } catch {}
        }
      },
    }),
    { name: 'seareiros-receitas', storage: createJSONStorage(() => localStorage) }
  )
);
