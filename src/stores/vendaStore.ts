'use client';
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { ItemVenda, StatusItemVenda } from '../types';
import { gerarId, agora } from '../lib/utils';

interface VendaState {
  itens: ItemVenda[];
  fetchVendasEvento: (eventoId: string) => Promise<void>;
  addItem: (data: Omit<ItemVenda, 'id' | 'quantidade_vendida' | 'receita_total' | 'created_at' | 'updated_at'>) => Promise<ItemVenda>;
  registrarVenda: (itemId: string, qtd: number) => Promise<void>;
  recolher: (itemId: string) => Promise<void>;
  getItensPorEvento: (eventoId: string) => ItemVenda[];
  getTotalArrecadado: (eventoId: string) => number;
  getTotalGeralArrecadado: () => number;
}

export const useVendaStore = create<VendaState>()(
  persist(
    (set, get) => ({
      itens: [],
      fetchVendasEvento: async (eventoId) => {
        try {
          const res = await fetch(`/api/eventos/${eventoId}/vendas`);
          if (res.ok) {
            const data = await res.json();
            set(s => ({ itens: [...s.itens.filter(i => i.evento_id !== eventoId), ...data] }));
          }
        } catch {}
      },
      addItem: async (data) => {
        const local: ItemVenda = { ...data, id: gerarId(), quantidade_vendida: 0, receita_total: 0, created_at: agora(), updated_at: agora() };
        set(s => ({ itens: [...s.itens, local] }));
        try {
          const res = await fetch(`/api/eventos/${data.evento_id}/vendas`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
          if (res.ok) {
            const item = await res.json();
            set(s => ({ itens: s.itens.map(x => x.id === local.id ? item : x) }));
            return item;
          }
        } catch {}
        return local;
      },
      registrarVenda: async (itemId, qtd) => {
        set(s => ({
          itens: s.itens.map(i => {
            if (i.id !== itemId) return i;
            const novaQtd = i.quantidade_vendida + qtd;
            return { ...i, quantidade_vendida: novaQtd, receita_total: i.preco_venda * novaQtd, status: novaQtd >= i.quantidade_disponivel ? 'esgotado' : 'disponivel' as StatusItemVenda, updated_at: agora() };
          }),
        }));
        const item = get().itens.find(i => i.id === itemId);
        if (item) {
          try {
            await fetch(`/api/eventos/${item.evento_id}/vendas`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'venda', item_id: itemId, quantidade: qtd }) });
          } catch {}
        }
      },
      recolher: async (itemId) => {
        set(s => ({ itens: s.itens.map(i => i.id === itemId ? { ...i, status: 'recolhido' as StatusItemVenda, updated_at: agora() } : i) }));
        const item = get().itens.find(i => i.id === itemId);
        if (item) {
          try {
            await fetch(`/api/eventos/${item.evento_id}/vendas`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'recolher', item_id: itemId }) });
          } catch {}
        }
      },
      getItensPorEvento: (eventoId) => get().itens.filter(i => i.evento_id === eventoId),
      getTotalArrecadado: (eventoId) => get().itens.filter(i => i.evento_id === eventoId).reduce((a, i) => a + i.receita_total, 0),
      getTotalGeralArrecadado: () => get().itens.reduce((a, i) => a + i.receita_total, 0),
    }),
    { name: 'seareiros-vendas', storage: createJSONStorage(() => localStorage) }
  )
);
