'use client'

import { FileText, Pin, PinOff, X } from 'lucide-react'
import React, { useEffect, useMemo, useRef, useState } from 'react'

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { Tab } from '@/store/tabs-store'

type TabItemProps = {
  tab: Tab
  isActive: boolean
  isClosing?: boolean
  onActivate: () => void
  onRequestClose: () => void
  onArrowNavigate?: (direction: 1 | -1) => void
  onRename: (title: string) => void
  onCloseOthers: () => void
  onCloseRight: () => void
  onCloseAll: () => void
  onTogglePin: () => void
  setTriggerRef?: (el: HTMLElement | null) => void
}

export const TabItem = ({
  tab,
  isActive,
  isClosing,
  onActivate,
  onRequestClose,
  onArrowNavigate,
  onRename,
  onCloseOthers,
  onCloseRight,
  onCloseAll,
  onTogglePin,
  setTriggerRef,
}: TabItemProps) => {
  const [isRenaming, setIsRenaming] = useState(false)
  const [renameValue, setRenameValue] = useState(tab.title)
  const [menuOpen, setMenuOpen] = useState(false)
  const inputRef = useRef<HTMLInputElement | null>(null)
  const openedByContextMenuRef = useRef(false)

  useEffect(() => {
    if (!isRenaming) return
    setRenameValue(tab.title)
    setTimeout(() => inputRef.current?.focus(), 0)
  }, [isRenaming, tab.title])

  useEffect(() => {
    if (isRenaming) return
    setRenameValue(tab.title)
  }, [isRenaming, tab.title])

  const iconNode = useMemo(() => {
    if (tab.icon) return <span className="text-sm leading-none">{tab.icon}</span>
    return <FileText className="h-4 w-4 shrink-0" />
  }, [tab.icon])

  const handleCloseClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    onRequestClose()
  }

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button === 1) {
      e.preventDefault()
      e.stopPropagation()
      onRequestClose()
    }
  }

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    openedByContextMenuRef.current = true
    setMenuOpen(true)
  }

  const handleRenameCommit = () => {
    const next = renameValue.trim()
    if (next.length > 0 && next !== tab.title) onRename(next)
    setIsRenaming(false)
  }

  const handleRenameKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      e.stopPropagation()
      handleRenameCommit()
      return
    }
    if (e.key === 'Escape') {
      e.preventDefault()
      e.stopPropagation()
      setIsRenaming(false)
    }
  }

  const ariaLabel = tab.pinned ? tab.title : undefined

  return (
    <div
      className={cn(
        'shrink-0 transition-[max-width,opacity,transform,margin] duration-150 ease-out',
        tab.pinned ? 'max-w-[52px] hover:max-w-[220px]' : 'max-w-[220px]',
        isClosing && 'max-w-0 opacity-0 -translate-y-0.5 mr-0',
      )}
    >
      <DropdownMenu
        open={menuOpen}
        onOpenChange={(open) => {
          if (open && !openedByContextMenuRef.current) return
          setMenuOpen(open)
          if (!open) openedByContextMenuRef.current = false
        }}
      >
        <DropdownMenuTrigger asChild>
          <div
            ref={setTriggerRef}
            role="tab"
            aria-selected={isActive}
            aria-label={ariaLabel}
            tabIndex={isActive ? 0 : -1}
            data-active={isActive ? 'true' : 'false'}
            data-pinned={tab.pinned ? 'true' : 'false'}
            onClick={() => {
              if (!isRenaming) onActivate()
            }}
            onMouseDown={handleMouseDown}
            onContextMenu={handleContextMenu}
            onKeyDown={(e) => {
              if (isRenaming) return
              if (e.key === 'ArrowLeft') {
                e.preventDefault()
                onArrowNavigate?.(-1)
              }
              if (e.key === 'ArrowRight') {
                e.preventDefault()
                onArrowNavigate?.(1)
              }
            }}
            onDoubleClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              if (!tab.pinned) setIsRenaming(true)
            }}
            className={cn(
              'group relative flex h-8 items-center gap-2 rounded-md border pl-2 pr-2 text-sm',
              'select-none transition-[padding,background-color,color,border-color]',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
              isActive
                ? 'bg-background text-foreground border-border border-b-transparent shadow-sm'
                : 'bg-muted/30 text-muted-foreground border-transparent hover:bg-muted/60 hover:text-foreground',
              !isRenaming && 'hover:pr-9',
              tab.pinned && 'justify-center px-1 hover:justify-start hover:pl-2 hover:pr-9',
            )}
            title={tab.title}
          >
            <span className={cn('shrink-0', tab.pinned ? 'mx-auto group-hover:mx-0' : undefined)}>
              {iconNode}
            </span>

            {tab.pinned ? (
              <span className="min-w-0 max-w-0 flex-1 overflow-hidden opacity-0 transition-[max-width,opacity] duration-150 ease-out group-hover:max-w-[180px] group-hover:opacity-100">
                <span className="block truncate">{tab.title}</span>
              </span>
            ) : (
              <span className="min-w-0 flex-1">
                {isRenaming ? (
                  <Input
                    ref={inputRef}
                    value={renameValue}
                    onChange={(e) => setRenameValue(e.target.value)}
                    onBlur={handleRenameCommit}
                    onKeyDown={handleRenameKeyDown}
                    className="h-7 px-2 py-0 text-sm"
                  />
                ) : (
                  <span className="block truncate">{tab.title}</span>
                )}
              </span>
            )}

            {!isRenaming && (
              <>
                {tab.isDirty && (
                  <span
                    className={cn(
                      'h-2 w-2 rounded-full bg-primary',
                      tab.pinned &&
                        'w-0 opacity-0 overflow-hidden transition-[width,opacity] duration-150 ease-out group-hover:w-2 group-hover:opacity-100',
                    )}
                  />
                )}
                <button
                  type="button"
                  aria-label="Close tab"
                  onClick={handleCloseClick}
                  className={cn(
                    'absolute right-1 top-1/2 inline-flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-sm',
                    'text-muted-foreground hover:text-foreground hover:bg-muted/70',
                    'opacity-0 scale-95 transition-[opacity,transform] duration-150 ease-out',
                    'pointer-events-none group-hover:pointer-events-auto',
                    'group-hover:opacity-100 group-hover:scale-100',
                  )}
                >
                  <X className="h-4 w-4" />
                </button>
              </>
            )}
          </div>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="start" side="bottom">
          <DropdownMenuItem
            onSelect={(e) => {
              e.preventDefault()
              onRequestClose()
            }}
          >
            关闭
            <DropdownMenuShortcut>Ctrl/Cmd W</DropdownMenuShortcut>
          </DropdownMenuItem>
          <DropdownMenuItem
            onSelect={(e) => {
              e.preventDefault()
              onCloseOthers()
            }}
          >
            关闭其他
          </DropdownMenuItem>
          <DropdownMenuItem
            onSelect={(e) => {
              e.preventDefault()
              onCloseRight()
            }}
          >
            关闭右侧
          </DropdownMenuItem>
          <DropdownMenuItem
            onSelect={(e) => {
              e.preventDefault()
              onCloseAll()
            }}
          >
            关闭全部
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onSelect={(e) => {
              e.preventDefault()
              onTogglePin()
            }}
          >
            {tab.pinned ? (
              <>
                <PinOff />
                取消固定
              </>
            ) : (
              <>
                <Pin />
                固定
              </>
            )}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
