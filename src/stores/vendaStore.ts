'use client';
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { ItemVenda, StatusItemVenda } from '../types';
import { gerarId, agora } from '../lib/utils';

interface VendaState {
  itens: ItemVenda[];
  addItem: (data: Omit<ItemVenda, 'id' | 'quantidade_vendida' | 'receita_total' | 'created_at' | 'updated_at'>) => ItemVenda;
  registrarVenda: (itemId: string, qtd: number) => void;
  recolher: (itemId: string) => void;
  getItensPorEvento: (eventoId: string) => ItemVenda[];
  getTotalArrecadado: (eventoId: string) => number;
  getTotalGeralArrecadado: () => number;
}

export const useVendaStore = create<VendaState>()(
  persist(
    (set, get) => ({
      itens: [],
      addItem: (data) => {
        const item: ItemVenda = { ...data, id: gerarId(), quantidade_vendida: 0, receita_total: 0, created_at: agora(), updated_at: agora() };
        set(s => ({ itens: [...s.itens, item] }));
        return item;
      },
      registrarVenda: (itemId, qtd) =>
        set(s => ({
          itens: s.itens.map(i => {
            if (i.id !== itemId) return i;
            const novaQtd = i.quantidade_vendida + qtd;
            return { ...i, quantidade_vendida: novaQtd, receita_total: i.preco_venda * novaQtd, status: novaQtd >= i.quantidade_disponivel ? 'esgotado' : 'disponivel', updated_at: agora() };
          }),
        })),
      recolher: (itemId) => set(s => ({ itens: s.itens.map(i => i.id === itemId ? { ...i, status: 'recolhido' as StatusItemVenda, updated_at: agora() } : i) })),
      getItensPorEvento: (eventoId) => get().itens.filter(i => i.evento_id === eventoId),
      getTotalArrecadado: (eventoId) => get().itens.filter(i => i.evento_id === eventoId).reduce((a, i) => a + i.receita_total, 0),
      getTotalGeralArrecadado: () => get().itens.reduce((a, i) => a + i.receita_total, 0),
    }),
    { name: 'seareiros-vendas', storage: createJSONStorage(() => localStorage) }
  )
);
