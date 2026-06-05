'use client';
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { Evento, EventoPrato, ListaCompras, ItemLista } from '../types';
import { MOCK_EVENTOS } from '../lib/mockData';
import { gerarId, agora, gerarListaCompras } from '../lib/utils';

interface EventoState {
  eventos: Evento[];
  listas: ListaCompras[];
  fetchEventos: () => Promise<void>;
  addEvento: (data: Omit<Evento, 'id' | 'created_at' | 'updated_at'>) => Promise<Evento>;
  updateEvento: (id: string, data: Partial<Evento>) => Promise<void>;
  deleteEvento: (id: string) => Promise<void>;
  getEvento: (id: string) => Evento | undefined;
  addPrato: (eventoId: string, prato: Omit<EventoPrato, 'id'>) => Promise<void>;
  removePrato: (eventoId: string, pratoId: string) => Promise<void>;
  updatePorcoes: (eventoId: string, pratoId: string, porcoes: number) => Promise<void>;
  gerarLista: (eventoId: string) => Promise<ListaCompras>;
  getLista: (eventoId: string) => ListaCompras | undefined;
  toggleItemComprado: (listaId: string, itemId: string) => Promise<void>;
  addItemExtra: (listaId: string, item: Omit<ItemLista, 'id' | 'lista_id'>) => Promise<void>;
  updateItemPreco: (listaId: string, itemId: string, preco: number) => Promise<void>;
}

export const useEventoStore = create<EventoState>()(
  persist(
    (set, get) => ({
      eventos: MOCK_EVENTOS, listas: [],
      fetchEventos: async () => {
        try {
          const res = await fetch('/api/eventos');
          if (res.ok) set({ eventos: await res.json() });
        } catch {}
      },
      addEvento: async (data) => {
        const local: Evento = { ...data, id: gerarId(), created_at: agora(), updated_at: agora() };
        set(s => ({ eventos: [...s.eventos, local] }));
        try {
          const res = await fetch('/api/eventos', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
          if (res.ok) {
            const e = await res.json();
            set(s => ({ eventos: s.eventos.map(x => x.id === local.id ? e : x) }));
            return e;
          }
        } catch {}
        return local;
      },
      updateEvento: async (id, data) => {
        set(s => ({ eventos: s.eventos.map(e => e.id === id ? { ...e, ...data, updated_at: agora() } : e) }));
        try {
          const res = await fetch(`/api/eventos/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
          if (res.ok) {
            const e = await res.json();
            set(s => ({ eventos: s.eventos.map(x => x.id === id ? e : x) }));
          }
        } catch {}
      },
      deleteEvento: async (id) => {
        set(s => ({ eventos: s.eventos.filter(e => e.id !== id), listas: s.listas.filter(l => l.evento_id !== id) }));
        try { await fetch(`/api/eventos/${id}`, { method: 'DELETE' }); } catch {}
      },
      getEvento: (id) => get().eventos.find(e => e.id === id),
      addPrato: async (eventoId, prato) => {
        const local = { ...prato, id: gerarId() };
        set(s => ({
          eventos: s.eventos.map(e => e.id === eventoId ? { ...e, pratos: [...(e.pratos || []), local], updated_at: agora() } : e),
        }));
        try {
          const res = await fetch(`/api/eventos/${eventoId}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'addPrato', receita_id: prato.receita_id, quantidade_porcoes: prato.quantidade_porcoes }) });
          if (res.ok) {
            const e = await res.json();
            set(s => ({ eventos: s.eventos.map(x => x.id === eventoId ? e : x) }));
          }
        } catch {}
      },
      removePrato: async (eventoId, pratoId) => {
        set(s => ({
          eventos: s.eventos.map(e => e.id === eventoId ? { ...e, pratos: (e.pratos || []).filter(p => p.id !== pratoId), updated_at: agora() } : e),
        }));
        try {
          await fetch(`/api/eventos/${eventoId}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'removePrato', prato_id: pratoId }) });
        } catch {}
      },
      updatePorcoes: async (eventoId, pratoId, porcoes) => {
        set(s => ({
          eventos: s.eventos.map(e => e.id === eventoId ? { ...e, pratos: (e.pratos || []).map(p => p.id === pratoId ? { ...p, quantidade_porcoes: porcoes } : p), updated_at: agora() } : e),
        }));
        try {
          await fetch(`/api/eventos/${eventoId}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'updatePorcoes', prato_id: pratoId, quantidade_porcoes: porcoes }) });
        } catch {}
      },
      gerarLista: async (eventoId) => {
        const evento = get().eventos.find(e => e.id === eventoId);
        const itensBase = gerarListaCompras(evento?.pratos || []);
        const listaId = gerarId();
        const lista: ListaCompras = {
          id: listaId, evento_id: eventoId, gerada_em: agora(),
          itens: itensBase.map(item => ({ ...item, id: gerarId(), lista_id: listaId })),
        };
        set(s => ({ listas: [...s.listas.filter(l => l.evento_id !== eventoId), lista] }));
        try {
          const res = await fetch(`/api/eventos/${eventoId}/lista-compras`, { method: 'POST' });
          if (res.ok) {
            const l = await res.json();
            set(s => ({ listas: [...s.listas.filter(x => x.evento_id !== eventoId), l] }));
            return l;
          }
        } catch {}
        return lista;
      },
      getLista: (eventoId) => get().listas.find(l => l.evento_id === eventoId),
      toggleItemComprado: async (listaId, itemId) => {
        set(s => ({
          listas: s.listas.map(l => l.id === listaId
            ? { ...l, itens: (l.itens || []).map(i => i.id === itemId ? { ...i, comprado: !i.comprado } : i) } : l),
        }));
        const lista = get().listas.find(l => l.id === listaId);
        if (lista) {
          try {
            await fetch(`/api/eventos/${lista.evento_id}/lista-compras`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'toggleComprado', item_id: itemId }) });
          } catch {}
        }
      },
      addItemExtra: async (listaId, item) => {
        set(s => ({
          listas: s.listas.map(l => l.id === listaId
            ? { ...l, itens: [...(l.itens || []), { ...item, id: gerarId(), lista_id: listaId }] } : l),
        }));
        const lista = get().listas.find(l => l.id === listaId);
        if (lista) {
          try {
            await fetch(`/api/eventos/${lista.evento_id}/lista-compras`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'addItemExtra', ...item }) });
          } catch {}
        }
      },
      updateItemPreco: async (listaId, itemId, preco) => {
        set(s => ({
          listas: s.listas.map(l => l.id === listaId
            ? { ...l, itens: (l.itens || []).map(i => i.id === itemId ? { ...i, preco_estimado: preco } : i) } : l),
        }));
        const lista = get().listas.find(l => l.id === listaId);
        if (lista) {
          try {
            await fetch(`/api/eventos/${lista.evento_id}/lista-compras`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'updatePreco', item_id: itemId, preco }) });
          } catch {}
        }
      },
    }),
    { name: 'seareiros-eventos', storage: createJSONStorage(() => localStorage) }
  )
);
