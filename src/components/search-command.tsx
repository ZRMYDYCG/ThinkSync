'use client'

import { File, SlidersHorizontal } from 'lucide-react'
import { useLocale, useTranslations } from 'next-intl'
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

const GROUPS: DateGroupKey[] = ['today', 'week', 'month', 'older']

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

const formatTime = (date: Date, locale: string) =>
  new Intl.DateTimeFormat(locale, { hour: '2-digit', minute: '2-digit' }).format(date)

const formatMonthDay = (date: Date, locale: string) =>
  new Intl.DateTimeFormat(locale, { month: 'numeric', day: 'numeric' }).format(date)

const formatYearMonthDay = (date: Date, locale: string) =>
  new Intl.DateTimeFormat(locale, { year: 'numeric', month: 'numeric', day: 'numeric' }).format(
    date,
  )

const formatDateLabel = (
  date: Date,
  now: Date,
  locale: string,
  tSearch: (key: string, values?: Record<string, string | number | Date>) => string,
) => {
  if (Number.isNaN(date.getTime())) return ''
  const diffDays = Math.max(0, getDayDiff(date, now))
  if (diffDays === 0) {
    return tSearch('todayAt', { time: formatTime(date, locale) })
  }
  if (diffDays < 7) {
    return tSearch('daysAgo', { count: diffDays })
  }
  if (date.getFullYear() === now.getFullYear()) {
    return formatMonthDay(date, locale)
  }
  return formatYearMonthDay(date, locale)
}

export const SearchCommand = () => {
  const { user } = useAuth()
  const router = useRouter()
  const locale = useLocale()
  const tSearch = useTranslations('App.searchCommand')
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
    ? tSearch('placeholderWithName', { name: placeholderTarget })
    : tSearch('placeholder')
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
            className="border-border bg-background text-muted-foreground hover:bg-muted/60 flex h-7 w-7 items-center justify-center rounded-full border transition-colors"
            aria-label={tSearch('filterAriaLabel')}
          >
            <SlidersHorizontal className="h-4 w-4" />
          </button>
        }
      />
      <CommandList className="max-h-none flex-1 px-2 py-2">
        <CommandEmpty>{tSearch('empty')}</CommandEmpty>
        {GROUPS.map((key) => {
          const items = groups[key]
          if (!items.length) return null
          return (
            <CommandGroup key={key} heading={tSearch(`group.${key}`)} className="px-2 py-1">
              {items.map((document) => {
                const dateLabel = formatDateLabel(getDocumentDate(document), now, locale, tSearch)
                return (
                  <CommandItem
                    key={document.id}
                    value={`${document.title}-${document.id}`}
                    title={document.title}
                    onSelect={() => onSelect(document.id)}
                    className="data-[selected='true']:bg-muted/70 data-[selected=true]:text-foreground gap-3 rounded-lg px-3 py-2"
                  >
                    <span className="text-muted-foreground flex h-7 w-7 items-center justify-center">
                      {document.icon ? (
                        <span className="text-[18px]">{document.icon}</span>
                      ) : (
                        <File className="h-4 w-4" />
                      )}
                    </span>
                    <span className="text-foreground min-w-0 flex-1 truncate text-sm">
                      {document.title}
                    </span>
                    {dateLabel ? (
                      <span className="text-muted-foreground ml-3 shrink-0 text-xs">
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
      <div className="border-border/70 text-muted-foreground flex flex-wrap items-center gap-x-4 gap-y-1 border-t px-4 py-2 text-xs">
        <div className="flex items-center gap-1">
          <kbd className={hintClassName}>↑↓</kbd>
          <span>{tSearch('hint.select')}</span>
        </div>
        <div className="flex items-center gap-1">
          <kbd className={hintClassName}>Enter</kbd>
          <span>{tSearch('hint.open')}</span>
        </div>
        <div className="flex items-center gap-1">
          <kbd className={hintClassName}>Ctrl+Enter</kbd>
          <span>{tSearch('hint.openInNewTab')}</span>
        </div>
        <div className="flex items-center gap-1">
          <kbd className={hintClassName}>Ctrl+L</kbd>
          <span>{tSearch('hint.copyLink')}</span>
        </div>
        <div className="flex items-center gap-1">
          <kbd className={hintClassName}>Shift+Ctrl+K</kbd>
          <span>{tSearch('hint.commandSearch')}</span>
        </div>
      </div>
    </CommandDialog>
  )
}
