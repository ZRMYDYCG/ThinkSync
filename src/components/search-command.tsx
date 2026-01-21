'use client'

import { File, SlidersHorizontal } from 'lucide-react'
import { useRouter } from 'next/navigation'
import React, { useEffect, useMemo, useState } from 'react'

import type { Document } from '@/types/document'

import { useAuth } from '@/hooks/use-auth'
import { useDocumentsList } from '@/hooks/use-documents-list'
import { useSearch } from '@/hooks/useSearch'

import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from './ui/command'

const MS_PER_DAY = 24 * 60 * 60 * 1000

type DateGroupKey = 'today' | 'week' | 'month' | 'older'

const GROUPS: Array<{ key: DateGroupKey; label: string }> = [
  { key: 'today', label: '今天' },
  { key: 'week', label: '上周' },
  { key: 'month', label: '过去 30 天' },
  { key: 'older', label: '更早' },
]

const getDocumentDate = (document: Document) => new Date(document.updatedAt ?? document.createdAt)

const getDocumentTimestamp = (document: Document) => {
  const time = getDocumentDate(document).getTime()
  return Number.isNaN(time) ? 0 : time
}

const startOfDay = (date: Date) => new Date(date.getFullYear(), date.getMonth(), date.getDate())

const getDayDiff = (date: Date, now: Date) => {
  const diff = startOfDay(now).getTime() - startOfDay(date).getTime()
  return Math.floor(diff / MS_PER_DAY)
}

const getDateGroup = (date: Date, now: Date): DateGroupKey => {
  if (Number.isNaN(date.getTime())) return 'older'
  const diffDays = getDayDiff(date, now)
  if (diffDays <= 0) return 'today'
  if (diffDays <= 7) return 'week'
  if (diffDays <= 30) return 'month'
  return 'older'
}

const formatTime = (date: Date) => {
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  return `${hours}:${minutes}`
}

const formatDateLabel = (date: Date, now: Date) => {
  if (Number.isNaN(date.getTime())) return ''
  const diffDays = Math.max(0, getDayDiff(date, now))
  if (diffDays === 0) {
    return `今天 ${formatTime(date)}`
  }
  if (diffDays < 7) {
    return `${diffDays} 天前`
  }
  const month = date.getMonth() + 1
  const day = date.getDate()
  if (date.getFullYear() === now.getFullYear()) {
    return `${month}月${day}日`
  }
  return `${date.getFullYear()}年${month}月${day}日`
}

export const SearchCommand = () => {
  const { user } = useAuth()
  const router = useRouter()
  const { documents } = useDocumentsList({ type: 'search' })
  const [isMounted, setIsMounted] = useState(false)

  const toggle = useSearch((store) => store.toggle)
  const isOpen = useSearch((store) => store.isOpen)
  const onClose = useSearch((store) => store.onClose)

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault()
        toggle()
      }
    }

    document.addEventListener('keydown', down)

    return () => {
      document.removeEventListener('keydown', down)
    }
  }, [toggle])

  useEffect(() => {
    setIsMounted(true)
  }, [])

  const { groups, now } = useMemo(() => {
    const now = new Date()
    const sortedDocuments = (documents ?? []).toSorted(
      (a, b) => getDocumentTimestamp(b) - getDocumentTimestamp(a),
    )
    const groups: Record<DateGroupKey, Document[]> = {
      today: [],
      week: [],
      month: [],
      older: [],
    }

    sortedDocuments.forEach((document) => {
      const date = getDocumentDate(document)
      groups[getDateGroup(date, now)].push(document)
    })

    return { groups, now }
  }, [documents])

  if (!isMounted) {
    return null
  }

  const onSelect = (id: string) => {
    router.push(`/documents/${id}`)
    onClose()
  }

  const placeholderTarget = user?.name ?? user?.email
  const inputPlaceholder = placeholderTarget
    ? `在 ${placeholderTarget} 的 ThinkSync 中搜索或提问...`
    : '在你的 ThinkSync 中搜索或提问...'
  const hintClassName =
    'inline-flex h-5 select-none items-center rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground'

  return (
    <CommandDialog open={isOpen} onOpenChange={onClose}>
      <CommandInput
        placeholder={inputPlaceholder}
        containerClassName="border-b border-border/70 px-4"
        className="text-[15px]"
        rightSlot={
          <button
            type="button"
            className="flex h-7 w-7 items-center justify-center rounded-full border border-border bg-background text-muted-foreground transition-colors hover:bg-muted/60"
            aria-label="筛选"
          >
            <SlidersHorizontal className="h-4 w-4" />
          </button>
        }
      />
      <CommandList className="max-h-none flex-1 px-2 py-2">
        <CommandEmpty>未找到结果</CommandEmpty>
        {GROUPS.map(({ key, label }) => {
          const items = groups[key]
          if (!items.length) return null
          return (
            <CommandGroup key={key} heading={label} className="px-2 py-1">
              {items.map((document) => {
                const dateLabel = formatDateLabel(getDocumentDate(document), now)
                return (
                  <CommandItem
                    key={document.id}
                    value={`${document.title}-${document.id}`}
                    title={document.title}
                    onSelect={() => onSelect(document.id)}
                    className="gap-3 rounded-lg px-3 py-2 data-[selected='true']:bg-muted/70 data-[selected=true]:text-foreground"
                  >
                    <span className="flex h-7 w-7 items-center justify-center text-muted-foreground">
                      {document.icon ? (
                        <span className="text-[18px]">{document.icon}</span>
                      ) : (
                        <File className="h-4 w-4" />
                      )}
                    </span>
                    <span className="min-w-0 flex-1 truncate text-sm text-foreground">
                      {document.title}
                    </span>
                    {dateLabel ? (
                      <span className="ml-3 shrink-0 text-xs text-muted-foreground">
                        {dateLabel}
                      </span>
                    ) : null}
                  </CommandItem>
                )
              })}
            </CommandGroup>
          )
        })}
      </CommandList>
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 border-t border-border/70 px-4 py-2 text-xs text-muted-foreground">
        <div className="flex items-center gap-1">
          <kbd className={hintClassName}>↑↓</kbd>
          <span>选择</span>
        </div>
        <div className="flex items-center gap-1">
          <kbd className={hintClassName}>Enter</kbd>
          <span>打开</span>
        </div>
        <div className="flex items-center gap-1">
          <kbd className={hintClassName}>Ctrl+Enter</kbd>
          <span>在新选项卡中打开</span>
        </div>
        <div className="flex items-center gap-1">
          <kbd className={hintClassName}>Ctrl+L</kbd>
          <span>拷贝链接</span>
        </div>
        <div className="flex items-center gap-1">
          <kbd className={hintClassName}>Shift+Ctrl+K</kbd>
          <span>命令搜索</span>
        </div>
      </div>
    </CommandDialog>
  )
}
