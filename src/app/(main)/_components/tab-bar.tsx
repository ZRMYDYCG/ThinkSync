'use client'

import { ChevronsLeft, ChevronsRight, Maximize2, Minimize2 } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { usePathname, useRouter } from 'next/navigation'
import React, { useCallback, useEffect, useRef, useState } from 'react'

import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { useDocumentsApi } from '@/hooks/use-documents-api'
import { useDocumentsRefresh } from '@/hooks/use-documents-refresh'
import { cn } from '@/lib/utils'
import { useTabsStore } from '@/store/tabs-store'

import { TabItem } from './tab-item'

type TabBarProps = {
  isCollapsed?: boolean
  onExpandNav?: () => void
  onCollapseNav?: () => void
}

type DirtyCloseState =
  | { open: false }
  | {
      open: true
      tabId: string
      afterCloseRoute?: string
    }

export const TabBar = ({ isCollapsed, onExpandNav, onCollapseNav }: TabBarProps) => {
  const router = useRouter()
  const pathname = usePathname()
  const tTabBar = useTranslations('App.tabBar')
  const bump = useDocumentsRefresh((s) => s.bump)
  const { update } = useDocumentsApi()

  const tabs = useTabsStore((s) => s.tabs)
  const activeId = useTabsStore((s) => s.activeId)
  const openTab = useTabsStore((s) => s.openTab)
  const setActive = useTabsStore((s) => s.setActive)
  const closeTab = useTabsStore((s) => s.closeTab)
  const closeOthers = useTabsStore((s) => s.closeOthers)
  const closeRightOf = useTabsStore((s) => s.closeRightOf)
  const closeAll = useTabsStore((s) => s.closeAll)
  const reorderTabs = useTabsStore((s) => s.reorderTabs)
  const updateTabTitle = useTabsStore((s) => s.updateTabTitle)
  const togglePin = useTabsStore((s) => s.togglePin)

  const scrollRef = useRef<HTMLDivElement | null>(null)
  const tabTriggerRefs = useRef(new Map<string, HTMLElement | null>())
  const dragFromIndexRef = useRef<number | null>(null)
  const closeTimerRefs = useRef(new Map<string, number>())

  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(false)
  const [closingIds, setClosingIds] = useState<Set<string>>(new Set())
  const [dirtyClose, setDirtyClose] = useState<DirtyCloseState>({ open: false })
  const [isFullscreen, setIsFullscreen] = useState(false)

  const getDocIdFromPathname = useCallback((pathname: string) => {
    const match = pathname.match(/^\/documents\/([^/]+)$/)
    return match?.[1] ?? null
  }, [])

  useEffect(() => {
    const docId = getDocIdFromPathname(pathname)
    if (!docId) return
    openTab({
      docId,
      route: pathname,
    })
  }, [getDocIdFromPathname, openTab, pathname])

  const updateScrollMasks = useCallback(() => {
    const el = scrollRef.current
    if (!el) return
    const left = el.scrollLeft
    const max = el.scrollWidth - el.clientWidth
    setCanScrollLeft(left > 2)
    setCanScrollRight(max - left > 2)
  }, [])

  useEffect(() => {
    updateScrollMasks()
    const onResize = () => updateScrollMasks()
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [updateScrollMasks])

  useEffect(() => {
    updateScrollMasks()
  }, [tabs.length, updateScrollMasks])

  useEffect(() => {
    const el = activeId ? tabTriggerRefs.current.get(activeId) : null
    if (!el) return
    el.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' })
  }, [activeId])

  useEffect(() => {
    const onFullscreenChange = () => setIsFullscreen(Boolean(document.fullscreenElement))
    onFullscreenChange()
    document.addEventListener('fullscreenchange', onFullscreenChange)
    return () => document.removeEventListener('fullscreenchange', onFullscreenChange)
  }, [])

  const toggleFullscreen = useCallback(async () => {
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen()
        return
      }
      await document.documentElement.requestFullscreen()
    } catch {
      return
    }
  }, [])

  const forceClose = useCallback(
    (tabId: string, afterCloseRoute?: string) => {
      if (closingIds.has(tabId)) return
      setClosingIds((prev) => new Set(prev).add(tabId))
      const timer = window.setTimeout(() => {
        closeTab(tabId, { force: true })
        if (afterCloseRoute) router.push(afterCloseRoute)
        setClosingIds((prev) => {
          const next = new Set(prev)
          next.delete(tabId)
          return next
        })
        closeTimerRefs.current.delete(tabId)
      }, 160)
      closeTimerRefs.current.set(tabId, timer)
    },
    [closeTab, closingIds, router],
  )

  const requestClose = useCallback(
    (tabId: string) => {
      const tab = tabs.find((t) => t.id === tabId)
      if (!tab) return
      const isClosingActive = activeId === tabId
      const closingIndex = tabs.findIndex((t) => t.id === tabId)
      const afterCloseRoute =
        isClosingActive && closingIndex !== -1
          ? (tabs[closingIndex - 1]?.route ?? tabs[closingIndex + 1]?.route ?? '/documents')
          : undefined
      if (tab.isDirty) {
        setDirtyClose({ open: true, tabId, afterCloseRoute })
        return
      }
      forceClose(tabId, afterCloseRoute)
    },
    [activeId, forceClose, tabs],
  )

  const activate = useCallback(
    (tabId: string) => {
      const tab = tabs.find((t) => t.id === tabId)
      if (!tab) return
      setActive(tabId)
      router.push(tab.route)
    },
    [router, setActive, tabs],
  )

  const rename = useCallback(
    async (tabId: string, title: string) => {
      const tab = tabs.find((t) => t.id === tabId)
      if (!tab) return
      updateTabTitle(tabId, title)
      await update(tab.docId, { title })
      bump()
    },
    [bump, tabs, update, updateTabTitle],
  )

  const selectRelative = useCallback(
    (direction: 1 | -1) => {
      if (tabs.length === 0) return
      const idx = activeId ? tabs.findIndex((t) => t.id === activeId) : -1
      const nextIndex = idx === -1 ? 0 : (idx + direction + tabs.length) % tabs.length
      const next = tabs[nextIndex]
      if (!next) return
      activate(next.id)
    },
    [activeId, activate, tabs],
  )

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const isMod = e.metaKey || e.ctrlKey
      if (!isMod) return

      const target = e.target as HTMLElement | null
      const tag = target?.tagName?.toLowerCase()
      const isTypingContext =
        !!target?.isContentEditable || tag === 'input' || tag === 'textarea' || tag === 'select'

      if (e.key.toLowerCase() === 'w') {
        if (!activeId) return
        if (isTypingContext) return
        e.preventDefault()
        requestClose(activeId)
        return
      }

      if (e.key === 'Tab') {
        if (isTypingContext) return
        e.preventDefault()
        selectRelative(e.shiftKey ? -1 : 1)
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [activeId, requestClose, selectRelative])

  useEffect(() => {
    const timers = closeTimerRefs.current
    return () => {
      for (const timer of timers.values()) window.clearTimeout(timer)
      timers.clear()
    }
  }, [])

  return (
    <div className="bg-background sticky top-0 z-[99999] border-b">
      <div className="flex items-stretch">
        {typeof isCollapsed === 'boolean' && onExpandNav && onCollapseNav && (
          <div className="flex shrink-0 items-center px-2 py-1">
            {isCollapsed ? (
              <button type="button" onClick={onExpandNav} aria-label="Expand navigation">
                <ChevronsRight className="text-muted-foreground h-5 w-5" />
              </button>
            ) : (
              <button type="button" onClick={onCollapseNav} aria-label="Collapse navigation">
                <ChevronsLeft className="text-muted-foreground h-5 w-5" />
              </button>
            )}
          </div>
        )}

        <div className="relative min-w-0 flex-1">
          <div
            ref={scrollRef}
            onScroll={updateScrollMasks}
            onWheel={(e) => {
              const el = scrollRef.current
              if (!el) return
              if (Math.abs(e.deltaY) <= Math.abs(e.deltaX)) return
              el.scrollLeft += e.deltaY
            }}
            className="overflow-x-auto"
          >
            <div
              role="tablist"
              aria-label="打开的文档标签"
              className={cn(
                'relative flex min-w-max items-center gap-1 px-2 py-1',
                tabs.length === 0 && 'min-w-0 w-full',
              )}
            >
              {tabs.length === 0 ? (
                <div className="text-muted-foreground flex h-8 w-full items-center justify-center text-sm">
                  {tTabBar('emptyState')}
                </div>
              ) : (
                tabs.map((tab, index) => (
                  <div
                    key={tab.id}
                    draggable
                    onDragStart={() => {
                      dragFromIndexRef.current = index
                    }}
                    onDragOver={(e) => {
                      e.preventDefault()
                    }}
                    onDrop={() => {
                      const from = dragFromIndexRef.current
                      if (from === null) return
                      reorderTabs(from, index)
                      dragFromIndexRef.current = null
                    }}
                  >
                    <TabItem
                      tab={tab}
                      isActive={tab.id === activeId}
                      isClosing={closingIds.has(tab.id)}
                      setTriggerRef={(el) => tabTriggerRefs.current.set(tab.id, el)}
                      onActivate={() => activate(tab.id)}
                      onRequestClose={() => requestClose(tab.id)}
                      onArrowNavigate={(direction) => selectRelative(direction)}
                      onRename={(title) => rename(tab.id, title)}
                      onCloseOthers={() => closeOthers(tab.id)}
                      onCloseRight={() => closeRightOf(tab.id)}
                      onCloseAll={() => closeAll()}
                      onTogglePin={() => togglePin(tab.id)}
                    />
                  </div>
                ))
              )}
            </div>
          </div>

          <div
            aria-hidden="true"
            className={cn(
              'pointer-events-none absolute left-0 top-0 h-full w-8 bg-gradient-to-r from-background to-transparent transition-opacity',
              canScrollLeft ? 'opacity-100' : 'opacity-0',
            )}
          />
          <div
            aria-hidden="true"
            className={cn(
              'pointer-events-none absolute right-0 top-0 h-full w-8 bg-gradient-to-l from-background to-transparent transition-opacity',
              canScrollRight ? 'opacity-100' : 'opacity-0',
            )}
          />
        </div>

        <div className="flex shrink-0 items-center gap-1 px-2 py-1">
          <Button
            variant="ghost"
            size="icon"
            className="text-muted-foreground hover:bg-muted/60 hover:text-foreground h-8 w-8"
            aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
            onClick={toggleFullscreen}
          >
            {isFullscreen ? <Minimize2 /> : <Maximize2 />}
          </Button>
        </div>
      </div>

      <AlertDialog
        open={dirtyClose.open}
        onOpenChange={(open) => setDirtyClose(open ? dirtyClose : { open: false })}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>此标签包含未保存改动</AlertDialogTitle>
            <AlertDialogDescription>
              你可以先保存，再关闭；或直接关闭并丢弃未保存改动。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setDirtyClose({ open: false })
              }}
            >
              取消
            </Button>
            <Button
              variant="secondary"
              onClick={async () => {
                if (!dirtyClose.open) return
                const tab = tabs.find((t) => t.id === dirtyClose.tabId)
                if (tab) {
                  window.dispatchEvent(
                    new CustomEvent('thinksync:tab-save-request', { detail: { docId: tab.docId } }),
                  )
                }
                setDirtyClose({ open: false })
                if (dirtyClose.open) forceClose(dirtyClose.tabId, dirtyClose.afterCloseRoute)
              }}
            >
              保存并关闭
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (!dirtyClose.open) return
                const tabId = dirtyClose.tabId
                const afterCloseRoute = dirtyClose.afterCloseRoute
                setDirtyClose({ open: false })
                forceClose(tabId, afterCloseRoute)
              }}
            >
              不保存直接关闭
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
