'use client';
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { Profile, EventoVoluntario } from '../types';
import { MOCK_VOLUNTARIOS } from '../lib/mockData';
import { gerarId, agora } from '../lib/utils';

interface VoluntarioState {
  voluntarios: Profile[];
  escalas: EventoVoluntario[];
  addVoluntario: (data: Omit<Profile, 'id' | 'created_at' | 'updated_at'>) => Profile;
  updateVoluntario: (id: string, data: Partial<Profile>) => void;
  escalar: (escala: Omit<EventoVoluntario, 'id' | 'created_at'>) => void;
  removerEscala: (id: string) => void;
  getEscalasEvento: (eventoId: string) => EventoVoluntario[];
  confirmarPresenca: (escalaId: string, status: EventoVoluntario['status_confirmacao']) => void;
}

export const useVoluntarioStore = create<VoluntarioState>()(
  persist(
    (set, get) => ({
      voluntarios: MOCK_VOLUNTARIOS, escalas: [],
      addVoluntario: (data) => {
        const v: Profile = { ...data, id: gerarId(), created_at: agora(), updated_at: agora() };
        set(s => ({ voluntarios: [...s.voluntarios, v] }));
        return v;
      },
      updateVoluntario: (id, data) =>
        set(s => ({ voluntarios: s.voluntarios.map(v => v.id === id ? { ...v, ...data, updated_at: agora() } : v) })),
      escalar: (escala) =>
        set(s => ({ escalas: [...s.escalas, { ...escala, id: gerarId(), created_at: agora() }] })),
      removerEscala: (id) => set(s => ({ escalas: s.escalas.filter(e => e.id !== id) })),
      getEscalasEvento: (eventoId) => {
        const escalas = get().escalas.filter(e => e.evento_id === eventoId);
        const voluntarios = get().voluntarios;
        return escalas.map(e => ({ ...e, voluntario: voluntarios.find(v => v.id === e.voluntario_id) }));
      },
      confirmarPresenca: (escalaId, status) =>
        set(s => ({ escalas: s.escalas.map(e => e.id === escalaId ? { ...e, status_confirmacao: status } : e) })),
    }),
    { name: 'seareiros-voluntarios', storage: createJSONStorage(() => localStorage) }
  )
);
