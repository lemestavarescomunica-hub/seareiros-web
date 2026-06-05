'use client';
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { Cotacao, CotacaoFornecedor, CotacaoItem, CotacaoPreco } from '../types';
import { gerarId, agora } from '../lib/utils';

interface NovaCotacaoData {
  nome: string;
  evento_id?: string;
  evento_nome?: string;
  fornecedores: string[];
  itens: { produto_id?: string; nome_produto: string; quantidade: number; unidade: string }[];
}

interface CotacaoState {
  cotacoes: Cotacao[];
  fetchCotacoes: () => Promise<void>;
  addCotacao: (data: NovaCotacaoData) => Promise<Cotacao>;
  getCotacao: (id: string) => Cotacao | undefined;
  updatePreco: (cotacaoId: string, itemId: string, fornecedorId: string, preco: number | undefined) => Promise<void>;
  concluirCotacao: (cotacaoId: string) => Promise<void>;
  deleteCotacao: (id: string) => Promise<void>;
  addFornecedor: (cotacaoId: string, nome: string) => Promise<void>;
  addItem: (cotacaoId: string, item: { produto_id?: string; nome_produto: string; quantidade: number; unidade: string }) => Promise<void>;
}

function calcularMelhores(precos: CotacaoPreco[], itens: CotacaoItem[]): CotacaoItem[] {
  return itens.map(item => {
    let ps = item.precos;
    const validos = ps.filter(p => p.preco_unitario !== undefined && p.preco_unitario > 0);
    if (validos.length > 0) {
      const min = Math.min(...validos.map(p => p.preco_unitario!));
      ps = ps.map(p => ({ ...p, melhor_preco: p.preco_unitario === min && p.preco_unitario !== undefined && p.preco_unitario > 0 }));
    } else {
      ps = ps.map(p => ({ ...p, melhor_preco: false }));
    }
    return { ...item, precos: ps };
  });
}

export const useCotacaoStore = create<CotacaoState>()(
  persist(
    (set, get) => ({
      cotacoes: [],
      fetchCotacoes: async () => {
        try {
          const res = await fetch('/api/cotacoes');
          if (res.ok) set({ cotacoes: await res.json() });
        } catch {}
      },
      addCotacao: async (data) => {
        // Local optimistic
        const cotacaoId = gerarId();
        const fors: CotacaoFornecedor[] = data.fornecedores.map(n => ({ id: gerarId(), cotacao_id: cotacaoId, nome: n }));
        const its: CotacaoItem[] = data.itens.map(item => {
          const itemId = gerarId();
          return {
            id: itemId, cotacao_id: cotacaoId, produto_id: item.produto_id, nome_produto: item.nome_produto,
            quantidade: item.quantidade, unidade: item.unidade,
            precos: fors.map(f => ({ id: gerarId(), cotacao_item_id: itemId, fornecedor_id: f.id, preco_unitario: undefined, melhor_preco: false })),
          };
        });
        const local: Cotacao = { id: cotacaoId, nome: data.nome, evento_id: data.evento_id, evento_nome: data.evento_nome, status: 'em_andamento', fornecedores: fors, itens: its, created_at: agora(), updated_at: agora() };
        set(s => ({ cotacoes: [...s.cotacoes, local] }));
        try {
          const res = await fetch('/api/cotacoes', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
          if (res.ok) {
            const c = await res.json();
            set(s => ({ cotacoes: s.cotacoes.map(x => x.id === local.id ? c : x) }));
            return c;
          }
        } catch {}
        return local;
      },
      getCotacao: (id) => get().cotacoes.find(c => c.id === id),
      updatePreco: async (cotacaoId, itemId, fornecedorId, preco) => {
        set(s => ({
          cotacoes: s.cotacoes.map(c => {
            if (c.id !== cotacaoId) return c;
            let itens = c.itens.map(item => {
              if (item.id !== itemId) return item;
              let precos = item.precos.map(p => p.fornecedor_id === fornecedorId ? { ...p, preco_unitario: preco } : p);
              const validos = precos.filter(p => p.preco_unitario !== undefined && p.preco_unitario > 0);
              if (validos.length > 0) {
                const min = Math.min(...validos.map(p => p.preco_unitario!));
                precos = precos.map(p => ({ ...p, melhor_preco: p.preco_unitario === min && p.preco_unitario !== undefined && p.preco_unitario > 0 }));
              } else {
                precos = precos.map(p => ({ ...p, melhor_preco: false }));
              }
              return { ...item, precos };
            });
            return { ...c, itens, updated_at: agora() };
          }),
        }));
        try {
          await fetch(`/api/cotacoes/${cotacaoId}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'updatePreco', item_id: itemId, fornecedor_id: fornecedorId, preco }) });
        } catch {}
      },
      concluirCotacao: async (cotacaoId) => {
        set(s => ({ cotacoes: s.cotacoes.map(c => c.id === cotacaoId ? { ...c, status: 'concluida', updated_at: agora() } : c) }));
        try {
          await fetch(`/api/cotacoes/${cotacaoId}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'concluir' }) });
        } catch {}
      },
      deleteCotacao: async (id) => {
        set(s => ({ cotacoes: s.cotacoes.filter(c => c.id !== id) }));
        try { await fetch(`/api/cotacoes/${id}`, { method: 'DELETE' }); } catch {}
      },
      addFornecedor: async (cotacaoId, nome) => {
        const fornecedorId = gerarId();
        set(s => ({
          cotacoes: s.cotacoes.map(c => {
            if (c.id !== cotacaoId) return c;
            const novoF: CotacaoFornecedor = { id: fornecedorId, cotacao_id: cotacaoId, nome };
            const itens = c.itens.map(item => ({
              ...item,
              precos: [...item.precos, { id: gerarId(), cotacao_item_id: item.id, fornecedor_id: fornecedorId, preco_unitario: undefined, melhor_preco: false }],
            }));
            return { ...c, fornecedores: [...c.fornecedores, novoF], itens, updated_at: agora() };
          }),
        }));
        try {
          const res = await fetch(`/api/cotacoes/${cotacaoId}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'addFornecedor', nome }) });
          if (res.ok) {
            const c = await res.json();
            set(s => ({ cotacoes: s.cotacoes.map(x => x.id === cotacaoId ? c : x) }));
          }
        } catch {}
      },
      addItem: async (cotacaoId, item) => {
        set(s => ({
          cotacoes: s.cotacoes.map(c => {
            if (c.id !== cotacaoId) return c;
            const itemId = gerarId();
            const novoItem: CotacaoItem = { id: itemId, cotacao_id: cotacaoId, produto_id: item.produto_id, nome_produto: item.nome_produto, quantidade: item.quantidade, unidade: item.unidade, precos: c.fornecedores.map(f => ({ id: gerarId(), cotacao_item_id: itemId, fornecedor_id: f.id, preco_unitario: undefined, melhor_preco: false })) };
            return { ...c, itens: [...c.itens, novoItem], updated_at: agora() };
          }),
        }));
        try {
          const res = await fetch(`/api/cotacoes/${cotacaoId}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'addItem', ...item }) });
          if (res.ok) {
            const c = await res.json();
            set(s => ({ cotacoes: s.cotacoes.map(x => x.id === cotacaoId ? c : x) }));
          }
        } catch {}
      },
    }),
    { name: 'seareiros-cotacoes', storage: createJSONStorage(() => localStorage) }
  )
);
