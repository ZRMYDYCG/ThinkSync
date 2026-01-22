import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

export type TabMeta = {
  docId: string
  title?: string
  icon?: string
  route?: string
}

export type Tab = {
  id: string
  docId: string
  title: string
  icon?: string
  route: string
  isDirty: boolean
  pinned: boolean
  createdAt: number
  lastActiveAt: number
}

type TabsState = {
  tabs: Tab[]
  activeId: string | null
  openTab: (meta: TabMeta) => void
  setActive: (tabId: string) => void
  closeTab: (tabId: string, options?: { force?: boolean }) => void
  closeOthers: (tabId: string) => void
  closeRightOf: (tabId: string) => void
  closeAll: () => void
  reorderTabs: (fromIndex: number, toIndex: number) => void
  updateTabTitle: (tabId: string, title: string) => void
  setDirty: (tabId: string, isDirty: boolean) => void
  togglePin: (tabId: string) => void
}

const stablePartitionPinnedFirst = (tabs: Tab[]) => {
  const pinned: Tab[] = []
  const normal: Tab[] = []
  for (const tab of tabs) {
    if (tab.pinned) pinned.push(tab)
    else normal.push(tab)
  }
  return [...pinned, ...normal]
}

const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value))

const selectNextActiveIdAfterClose = (tabs: Tab[], closingIndex: number) => {
  const left = tabs[closingIndex - 1]
  if (left) return left.id
  const right = tabs[closingIndex + 1]
  if (right) return right.id
  return null
}

export const useTabsStore = create<TabsState>()(
  persist(
    (set, _get) => ({
      tabs: [],
      activeId: null,
      openTab: (meta) => {
        const now = Date.now()
        const id = meta.docId
        const route = meta.route ?? `/documents/${meta.docId}`

        set((state) => {
          const existingIndex = state.tabs.findIndex((t) => t.id === id)
          if (existingIndex !== -1) {
            const tabs = [...state.tabs]
            const existing = tabs[existingIndex]
            tabs[existingIndex] = {
              ...existing,
              title: meta.title ?? existing.title,
              icon: meta.icon ?? existing.icon,
              route,
              lastActiveAt: now,
            }
            return { tabs, activeId: id }
          }

          const nextTabs = stablePartitionPinnedFirst([
            ...state.tabs,
            {
              id,
              docId: meta.docId,
              title: meta.title || 'Untitled',
              icon: meta.icon,
              route,
              isDirty: false,
              pinned: false,
              createdAt: now,
              lastActiveAt: now,
            },
          ])

          return { tabs: nextTabs, activeId: id }
        })
      },
      setActive: (tabId) => {
        const now = Date.now()
        set((state) => ({
          activeId: tabId,
          tabs: state.tabs.map((t) => (t.id === tabId ? { ...t, lastActiveAt: now } : t)),
        }))
      },
      closeTab: (tabId) => {
        set((state) => {
          const index = state.tabs.findIndex((t) => t.id === tabId)
          if (index === -1) return state
          const nextActiveId =
            state.activeId === tabId
              ? selectNextActiveIdAfterClose(state.tabs, index)
              : state.activeId
          return {
            tabs: state.tabs.filter((t) => t.id !== tabId),
            activeId: nextActiveId,
          }
        })
      },
      closeOthers: (tabId) => {
        set((state) => {
          const keep = new Set<string>()
          keep.add(tabId)
          for (const t of state.tabs) {
            if (t.pinned) keep.add(t.id)
          }
          const nextTabs = state.tabs.filter((t) => keep.has(t.id))
          return { tabs: nextTabs, activeId: keep.has(tabId) ? tabId : (nextTabs[0]?.id ?? null) }
        })
      },
      closeRightOf: (tabId) => {
        set((state) => {
          const index = state.tabs.findIndex((t) => t.id === tabId)
          if (index === -1) return state
          const leftSide = state.tabs.slice(0, index + 1)
          const pinned = state.tabs.filter((t) => t.pinned)
          const pinnedIds = new Set(pinned.map((t) => t.id))
          const nextTabs = [
            ...leftSide,
            ...state.tabs.slice(index + 1).filter((t) => pinnedIds.has(t.id)),
          ]
          const activeStillExists = nextTabs.some((t) => t.id === state.activeId)
          return {
            tabs: stablePartitionPinnedFirst(nextTabs),
            activeId: activeStillExists ? state.activeId : tabId,
          }
        })
      },
      closeAll: () => set({ tabs: [], activeId: null }),
      reorderTabs: (fromIndex, toIndex) => {
        set((state) => {
          if (fromIndex === toIndex) return state
          const tabs = [...state.tabs]
          if (fromIndex < 0 || fromIndex >= tabs.length) return state
          if (toIndex < 0 || toIndex >= tabs.length) return state

          const pinnedCount = tabs.filter((t) => t.pinned).length
          const moving = tabs[fromIndex]
          const pinnedMin = 0
          const pinnedMax = Math.max(0, pinnedCount - 1)
          const normalMin = pinnedCount
          const normalMax = tabs.length - 1

          const nextToIndex = moving.pinned
            ? clamp(toIndex, pinnedMin, pinnedMax)
            : clamp(toIndex, normalMin, normalMax)

          const [removed] = tabs.splice(fromIndex, 1)
          tabs.splice(nextToIndex, 0, removed)
          return { tabs }
        })
      },
      updateTabTitle: (tabId, title) => {
        set((state) => ({
          tabs: state.tabs.map((t) => (t.id === tabId ? { ...t, title } : t)),
        }))
      },
      setDirty: (tabId, isDirty) => {
        set((state) => ({
          tabs: state.tabs.map((t) => (t.id === tabId ? { ...t, isDirty } : t)),
        }))
      },
      togglePin: (tabId) => {
        set((state) => {
          const index = state.tabs.findIndex((t) => t.id === tabId)
          if (index === -1) return state
          const tabs = [...state.tabs]
          const target = tabs[index]
          tabs.splice(index, 1)
          const next = { ...target, pinned: !target.pinned }
          tabs.push(next)
          return { tabs: stablePartitionPinnedFirst(tabs) }
        })
      },
    }),
    {
      name: 'thinksync-tabs',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        tabs: state.tabs,
        activeId: state.activeId,
      }),
    },
  ),
)
