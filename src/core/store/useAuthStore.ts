'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { IUser, ILoginCredentials } from '@src/core/models';

interface AuthState {
  user: IUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  /** Establece el usuario autenticado (llamado por MockAuthService tras login exitoso) */
  setUser: (user: IUser) => void;

  /** Limpia la sesión */
  logout: () => void;

  /** Guarda credenciales temporales mientras se resuelve el login */
  setLoading: (loading: boolean) => void;

  /** Guarda un mensaje de error de autenticación */
  setError: (error: string | null) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      setUser: (user) =>
        set({ user, isAuthenticated: true, error: null, isLoading: false }),

      logout: () =>
        set({ user: null, isAuthenticated: false, error: null }),

      setLoading: (isLoading) => set({ isLoading }),

      setError: (error) => set({ error, isLoading: false }),
    }),
    {
      name: 'clic-moda-auth',
      storage: createJSONStorage(() => localStorage),
      // Solo persistir datos mínimos, no el estado de loading/error
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
);

// Tipo de credenciales re-exportado para conveniencia
export type { ILoginCredentials };
