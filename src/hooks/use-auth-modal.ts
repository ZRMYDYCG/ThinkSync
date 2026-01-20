import { create } from 'zustand'

type AuthModalStore = {
  isOpen: boolean
  view: 'login' | 'register'
  onOpen: (view?: 'login' | 'register') => void
  onClose: () => void
  toggleView: () => void
}

export const useAuthModal = create<AuthModalStore>((set) => ({
  isOpen: false,
  view: 'login',
  onOpen: (view = 'login') => set({ isOpen: true, view }),
  onClose: () => set({ isOpen: false }),
  toggleView: () => set((state) => ({ view: state.view === 'login' ? 'register' : 'login' })),
}))
