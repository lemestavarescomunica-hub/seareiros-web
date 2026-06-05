'use client';
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { EstoqueItem, EstoqueMovimentacao, EstoqueLote, StatusLote } from '../types';
import { MOCK_ESTOQUE } from '../lib/mockData';
import { gerarId, agora, verificarValidade } from '../lib/utils';

interface EstoqueState {
  itens: EstoqueItem[];
  movimentacoes: EstoqueMovimentacao[];
  lotes: EstoqueLote[];
  fetchEstoque: () => Promise<void>;
  addItem: (data: Omit<EstoqueItem, 'id' | 'updated_at'>) => Promise<void>;
  movimentar: (estoqueId: string, tipo: 'entrada' | 'saida', quantidade: number, motivo?: string) => Promise<void>;
  getAlertas: () => EstoqueItem[];
  addLote: (data: Omit<EstoqueLote, 'id' | 'status' | 'created_at' | 'updated_at'>) => Promise<EstoqueLote>;
  resolverLote: (loteId: string, status: StatusLote, destino?: string) => Promise<void>;
  getLotesPorEstoque: (estoqueId: string) => EstoqueLote[];
  getLotesComAlerta: () => EstoqueLote[];
}

export const useEstoqueStore = create<EstoqueState>()(
  persist(
    (set, get) => ({
      itens: MOCK_ESTOQUE, movimentacoes: [], lotes: [],
      fetchEstoque: async () => {
        try {
          const res = await fetch('/api/estoque');
          if (res.ok) {
            const data = await res.json();
            set({ itens: data.itens, movimentacoes: data.movimentacoes, lotes: data.lotes });
          }
        } catch {}
      },
      addItem: async (data) => {
        const local = { ...data, id: gerarId(), updated_at: agora() };
        set(s => ({ itens: [...s.itens, local] }));
        try {
          const res = await fetch('/api/estoque', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'addItem', ...data }) });
          if (res.ok) {
            const item = await res.json();
            set(s => ({ itens: s.itens.map(x => x.id === local.id ? item : x) }));
          }
        } catch {}
      },
      movimentar: async (estoqueId, tipo, quantidade, motivo) => {
        const mov: EstoqueMovimentacao = { id: gerarId(), estoque_id: estoqueId, tipo_movimento: tipo, quantidade, motivo, data: agora() };
        set(s => ({
          movimentacoes: [...s.movimentacoes, mov],
          itens: s.itens.map(item => {
            if (item.id !== estoqueId) return item;
            const nova = tipo === 'entrada' ? item.quantidade_atual + quantidade : Math.max(0, item.quantidade_atual - quantidade);
            return { ...item, quantidade_atual: nova, updated_at: agora() };
          }),
        }));
        try {
          await fetch('/api/estoque', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'movimentar', estoque_id: estoqueId, tipo_movimento: tipo, quantidade, motivo }) });
        } catch {}
      },
      getAlertas: () => get().itens.filter(i => i.quantidade_atual < i.quantidade_minima),
      addLote: async (data) => {
        const local: EstoqueLote = { ...data, id: gerarId(), status: 'ok', created_at: agora(), updated_at: agora() };
        set(s => ({ lotes: [...s.lotes, local] }));
        try {
          const res = await fetch('/api/estoque', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'addLote', ...data }) });
          if (res.ok) {
            const lote = await res.json();
            set(s => ({ lotes: s.lotes.map(x => x.id === local.id ? lote : x) }));
            return lote;
          }
        } catch {}
        return local;
      },
      resolverLote: async (loteId, status, destino) => {
        set(s => ({ lotes: s.lotes.map(l => l.id === loteId ? { ...l, status, destino, updated_at: agora() } : l) }));
        try {
          await fetch('/api/estoque', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'resolverLote', lote_id: loteId, status, destino }) });
        } catch {}
      },
      getLotesPorEstoque: (estoqueId) =>
        get().lotes
          .filter(l => l.estoque_id === estoqueId && !['consumido','doado','vendido','descartado'].includes(l.status))
          .sort((a, b) => a.data_validade.localeCompare(b.data_validade)),
      getLotesComAlerta: () =>
        get().lotes.filter(l => {
          if (['consumido','doado','vendido','descartado'].includes(l.status)) return false;
          return verificarValidade(l.data_validade, l.alerta_dias_antes).status !== 'ok';
        }).sort((a, b) => a.data_validade.localeCompare(b.data_validade)),
    }),
    { name: 'seareiros-estoque', storage: createJSONStorage(() => localStorage) }
  )
);
