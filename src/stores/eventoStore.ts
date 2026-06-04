'use client';
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { Evento, EventoPrato, ListaCompras, ItemLista } from '../types';
import { MOCK_EVENTOS } from '../lib/mockData';
import { gerarId, agora, gerarListaCompras } from '../lib/utils';

interface EventoState {
  eventos: Evento[];
  listas: ListaCompras[];
  addEvento: (data: Omit<Evento, 'id' | 'created_at' | 'updated_at'>) => Evento;
  updateEvento: (id: string, data: Partial<Evento>) => void;
  deleteEvento: (id: string) => void;
  getEvento: (id: string) => Evento | undefined;
  addPrato: (eventoId: string, prato: Omit<EventoPrato, 'id'>) => void;
  removePrato: (eventoId: string, pratoId: string) => void;
  updatePorcoes: (eventoId: string, pratoId: string, porcoes: number) => void;
  gerarLista: (eventoId: string) => ListaCompras;
  getLista: (eventoId: string) => ListaCompras | undefined;
  toggleItemComprado: (listaId: string, itemId: string) => void;
  addItemExtra: (listaId: string, item: Omit<ItemLista, 'id' | 'lista_id'>) => void;
}

export const useEventoStore = create<EventoState>()(
  persist(
    (set, get) => ({
      eventos: MOCK_EVENTOS, listas: [],
      addEvento: (data) => {
        const e: Evento = { ...data, id: gerarId(), created_at: agora(), updated_at: agora() };
        set(s => ({ eventos: [...s.eventos, e] }));
        return e;
      },
      updateEvento: (id, data) =>
        set(s => ({ eventos: s.eventos.map(e => e.id === id ? { ...e, ...data, updated_at: agora() } : e) })),
      deleteEvento: (id) =>
        set(s => ({ eventos: s.eventos.filter(e => e.id !== id), listas: s.listas.filter(l => l.evento_id !== id) })),
      getEvento: (id) => get().eventos.find(e => e.id === id),
      addPrato: (eventoId, prato) =>
        set(s => ({
          eventos: s.eventos.map(e => e.id === eventoId
            ? { ...e, pratos: [...(e.pratos || []), { ...prato, id: gerarId() }], updated_at: agora() } : e),
        })),
      removePrato: (eventoId, pratoId) =>
        set(s => ({
          eventos: s.eventos.map(e => e.id === eventoId
            ? { ...e, pratos: (e.pratos || []).filter(p => p.id !== pratoId), updated_at: agora() } : e),
        })),
      updatePorcoes: (eventoId, pratoId, porcoes) =>
        set(s => ({
          eventos: s.eventos.map(e => e.id === eventoId
            ? { ...e, pratos: (e.pratos || []).map(p => p.id === pratoId ? { ...p, quantidade_porcoes: porcoes } : p), updated_at: agora() } : e),
        })),
      gerarLista: (eventoId) => {
        const evento = get().eventos.find(e => e.id === eventoId);
        const itensBase = gerarListaCompras(evento?.pratos || []);
        const listaId = gerarId();
        const lista: ListaCompras = {
          id: listaId, evento_id: eventoId, gerada_em: agora(),
          itens: itensBase.map(item => ({ ...item, id: gerarId(), lista_id: listaId })),
        };
        set(s => ({ listas: [...s.listas.filter(l => l.evento_id !== eventoId), lista] }));
        return lista;
      },
      getLista: (eventoId) => get().listas.find(l => l.evento_id === eventoId),
      toggleItemComprado: (listaId, itemId) =>
        set(s => ({
          listas: s.listas.map(l => l.id === listaId
            ? { ...l, itens: (l.itens || []).map(i => i.id === itemId ? { ...i, comprado: !i.comprado } : i) } : l),
        })),
      addItemExtra: (listaId, item) =>
        set(s => ({
          listas: s.listas.map(l => l.id === listaId
            ? { ...l, itens: [...(l.itens || []), { ...item, id: gerarId(), lista_id: listaId }] } : l),
        })),
    }),
    { name: 'seareiros-eventos', storage: createJSONStorage(() => localStorage) }
  )
);
