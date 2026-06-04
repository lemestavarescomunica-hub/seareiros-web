'use client';
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { Profile } from '../types';

interface AuthState {
  user: Profile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  updateProfile: (data: Partial<Profile>) => void;
}

const MOCK_USER: Profile = {
  id: 'user1', nome: 'Maria das Graças', telefone: '62999001234', role: 'admin',
  ativo: true, habilidades: ['Cozinheira', 'Coordenação'], disponibilidade: {},
  created_at: '2024-01-01', updated_at: '2024-01-01',
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null, isAuthenticated: false, isLoading: false,
      login: async (email) => {
        set({ isLoading: true });
        await new Promise(r => setTimeout(r, 600));
        set({ user: { ...MOCK_USER, nome: email.split('@')[0] || MOCK_USER.nome }, isAuthenticated: true, isLoading: false });
      },
      logout: () => set({ user: null, isAuthenticated: false }),
      updateProfile: (data) => set(s => ({ user: s.user ? { ...s.user, ...data } : null })),
    }),
    { name: 'seareiros-auth', storage: createJSONStorage(() => localStorage) }
  )
);
