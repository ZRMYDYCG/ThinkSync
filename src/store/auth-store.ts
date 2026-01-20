import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

import { AuthUser } from '@/types/auth'

type AuthState = {
  token: string | null
  user: AuthUser | null
  isLoading: boolean
  setToken: (token: string | null) => void
  setUser: (user: AuthUser | null) => void
  setLoading: (isLoading: boolean) => void
  clear: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      isLoading: true,
      setToken: (token) => set({ token }),
      setUser: (user) => set({ user }),
      setLoading: (isLoading) => set({ isLoading }),
      clear: () => set({ token: null, user: null }),
    }),
    {
      name: 'thinksync-auth',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ token: state.token, user: state.user }),
    },
  ),
)
