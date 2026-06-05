'use client';
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { Profile, EventoVoluntario } from '../types';
import { gerarId, agora } from '../lib/utils';

interface VoluntarioState {
  voluntarios: Profile[];
  escalas: EventoVoluntario[];
  fetchVoluntarios: () => Promise<void>;
  addVoluntario: (data: Omit<Profile, 'id' | 'created_at' | 'updated_at'>) => Promise<Profile>;
  updateVoluntario: (id: string, data: Partial<Profile>) => Promise<void>;
  escalar: (escala: Omit<EventoVoluntario, 'id' | 'created_at'>) => Promise<void>;
  removerEscala: (id: string) => Promise<void>;
  getEscalasEvento: (eventoId: string) => EventoVoluntario[];
  confirmarPresenca: (escalaId: string, status: EventoVoluntario['status_confirmacao']) => Promise<void>;
}

export const useVoluntarioStore = create<VoluntarioState>()(
  persist(
    (set, get) => ({
      voluntarios: [], escalas: [],
      fetchVoluntarios: async () => {
        try {
          const res = await fetch('/api/usuarios');
          if (res.ok) set({ voluntarios: await res.json() });
        } catch {}
      },
      addVoluntario: async (data) => {
        const local: Profile = { ...data, id: gerarId(), created_at: agora(), updated_at: agora() };
        set(s => ({ voluntarios: [...s.voluntarios, local] }));
        try {
          const res = await fetch('/api/usuarios', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
          if (res.ok) {
            const v = await res.json();
            set(s => ({ voluntarios: s.voluntarios.map(x => x.id === local.id ? v : x) }));
            return v;
          }
        } catch {}
        return local;
      },
      updateVoluntario: async (id, data) => {
        set(s => ({ voluntarios: s.voluntarios.map(v => v.id === id ? { ...v, ...data, updated_at: agora() } : v) }));
        try {
          await fetch('/api/usuarios', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, ...data }) });
        } catch {}
      },
      escalar: async (escala) => {
        const local = { ...escala, id: gerarId(), created_at: agora() };
        set(s => ({ escalas: [...s.escalas, local] }));
        try {
          const res = await fetch(`/api/eventos/${escala.evento_id}/voluntarios`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ voluntario_id: escala.voluntario_id, turno: escala.turno, funcao: escala.funcao }) });
          if (res.ok) {
            const e = await res.json();
            set(s => ({ escalas: s.escalas.map(x => x.id === local.id ? e : x) }));
          }
        } catch {}
      },
      removerEscala: async (id) => {
        const escala = get().escalas.find(e => e.id === id);
        set(s => ({ escalas: s.escalas.filter(e => e.id !== id) }));
        if (escala) {
          try {
            await fetch(`/api/eventos/${escala.evento_id}/voluntarios`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'remover', escala_id: id }) });
          } catch {}
        }
      },
      getEscalasEvento: (eventoId) => {
        const escalas = get().escalas.filter(e => e.evento_id === eventoId);
        const voluntarios = get().voluntarios;
        return escalas.map(e => ({ ...e, voluntario: voluntarios.find(v => v.id === e.voluntario_id) }));
      },
      confirmarPresenca: async (escalaId, status) => {
        const escala = get().escalas.find(e => e.id === escalaId);
        set(s => ({ escalas: s.escalas.map(e => e.id === escalaId ? { ...e, status_confirmacao: status } : e) }));
        if (escala) {
          try {
            await fetch(`/api/eventos/${escala.evento_id}/voluntarios`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'confirmar', escala_id: escalaId, status_confirmacao: status }) });
          } catch {}
        }
      },
    }),
    { name: 'seareiros-voluntarios', version: 2, storage: createJSONStorage(() => localStorage) }
  )
);
