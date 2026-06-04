'use client';
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { Receita, ReceitaIngrediente } from '../types';
import { MOCK_RECEITAS } from '../lib/mockData';
import { gerarId, agora } from '../lib/utils';

interface ReceitaState {
  receitas: Receita[];
  addReceita: (data: Omit<Receita, 'id' | 'created_at' | 'updated_at'>) => Receita;
  updateReceita: (id: string, data: Partial<Receita>) => void;
  deleteReceita: (id: string) => void;
  getReceita: (id: string) => Receita | undefined;
  addIngrediente: (receitaId: string, ing: Omit<ReceitaIngrediente, 'id'>) => void;
  removeIngrediente: (receitaId: string, ingId: string) => void;
}

export const useReceitaStore = create<ReceitaState>()(
  persist(
    (set, get) => ({
      receitas: MOCK_RECEITAS,
      addReceita: (data) => {
        const r: Receita = { ...data, id: gerarId(), created_at: agora(), updated_at: agora() };
        set(s => ({ receitas: [...s.receitas, r] }));
        return r;
      },
      updateReceita: (id, data) =>
        set(s => ({ receitas: s.receitas.map(r => r.id === id ? { ...r, ...data, updated_at: agora() } : r) })),
      deleteReceita: (id) => set(s => ({ receitas: s.receitas.filter(r => r.id !== id) })),
      getReceita: (id) => get().receitas.find(r => r.id === id),
      addIngrediente: (receitaId, ing) =>
        set(s => ({
          receitas: s.receitas.map(r => r.id === receitaId
            ? { ...r, ingredientes: [...(r.ingredientes || []), { ...ing, id: gerarId() }], updated_at: agora() }
            : r),
        })),
      removeIngrediente: (receitaId, ingId) =>
        set(s => ({
          receitas: s.receitas.map(r => r.id === receitaId
            ? { ...r, ingredientes: (r.ingredientes || []).filter(i => i.id !== ingId), updated_at: agora() }
            : r),
        })),
    }),
    { name: 'seareiros-receitas', storage: createJSONStorage(() => localStorage) }
  )
);
