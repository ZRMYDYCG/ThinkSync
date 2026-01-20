import { create } from 'zustand'

type DocumentsRefreshState = {
  refreshKey: number
  bump: () => void
}

export const useDocumentsRefresh = create<DocumentsRefreshState>((set) => ({
  refreshKey: 0,
  bump: () => set((state) => ({ refreshKey: state.refreshKey + 1 })),
}))
