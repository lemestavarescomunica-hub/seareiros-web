'use client';
import { create } from 'zustand';
import type { Profile } from '../types';

interface AuthState {
  profile: Profile | null;
  setProfile: (profile: Profile | null) => void;
  updateProfile: (data: Partial<Profile>) => void;
}

export const useAuthStore = create<AuthState>()((set) => ({
  profile: null,
  setProfile: (profile) => set({ profile }),
  updateProfile: (data) => set(s => ({ profile: s.profile ? { ...s.profile, ...data } : null })),
}));
