'use client';
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { HistoricoPreco } from '../types';
import { gerarId } from '../lib/utils';

interface PrecosState {
  historico: HistoricoPreco[];
  fetchHistoricoProduto: (produtoId: string) => Promise<void>;
  addHistorico: (data: Omit<HistoricoPreco, 'id'>) => Promise<void>;
  getHistoricoProduto: (produtoId: string) => HistoricoPreco[];
  calcularTendencia: (produtoId: string) => {
    tendencia: 'subiu' | 'desceu' | 'estavel' | 'sem_dados';
    variacao: number;
    precoAtual?: number;
    precoAnterior?: number;
  };
}

export const usePrecosStore = create<PrecosState>()(
  persist(
    (set, get) => ({
      historico: [],
      fetchHistoricoProduto: async (produtoId) => {
        try {
          const res = await fetch(`/api/historico-precos?produto_id=${produtoId}`);
          if (res.ok) {
            const data = await res.json();
            set(s => ({ historico: [...s.historico.filter(h => h.produto_id !== produtoId), ...data] }));
          }
        } catch {}
      },
      addHistorico: async (data) => {
        const local: HistoricoPreco = { ...data, id: gerarId() };
        set(s => ({ historico: [...s.historico, local] }));
        try {
          const res = await fetch('/api/historico-precos', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
          if (res.ok) {
            const h = await res.json();
            set(s => ({ historico: s.historico.map(x => x.id === local.id ? h : x) }));
          }
        } catch {}
      },
      getHistoricoProduto: (produtoId) =>
        get().historico
          .filter(h => h.produto_id === produtoId)
          .sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime()),
      calcularTendencia: (produtoId) => {
        const precos = get().historico
          .filter(h => h.produto_id === produtoId)
          .sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime());
        if (precos.length < 2) return { tendencia: 'sem_dados', variacao: 0, precoAtual: precos[0]?.preco };
        const atual = precos[0].preco;
        const anterior = precos[1].preco;
        const variacao = ((atual - anterior) / anterior) * 100;
        if (variacao > 2) return { tendencia: 'subiu', variacao, precoAtual: atual, precoAnterior: anterior };
        if (variacao < -2) return { tendencia: 'desceu', variacao, precoAtual: atual, precoAnterior: anterior };
        return { tendencia: 'estavel', variacao, precoAtual: atual, precoAnterior: anterior };
      },
    }),
    { name: 'seareiros-precos-historico', storage: createJSONStorage(() => localStorage) }
  )
);
