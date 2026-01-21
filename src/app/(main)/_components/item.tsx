'use client'

import { LucideIcon, ChevronDown, ChevronRight, Plus, MoreHorizontal, Trash } from 'lucide-react'
import { useRouter } from 'next/navigation'
import React from 'react'
import { toast } from 'sonner'

import {
  DropdownMenu,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu'
import { Skeleton } from '@/components/ui/skeleton'
import { useAuth } from '@/hooks/use-auth'
import { useDocumentsApi } from '@/hooks/use-documents-api'
import { useDocumentsRefresh } from '@/hooks/use-documents-refresh'
import { cn } from '@/lib/utils'

interface ItemProps {
  id?: string
  documentIcon?: string
  active?: boolean
  expanded?: boolean
  isSearch?: boolean
  level?: number
  onExpand?: () => void
  label: string
  onClick?: () => void
  icon: LucideIcon
}

const Item = ({
  id,
  label,
  onClick,
  icon: Icon,
  active,
  documentIcon,
  isSearch,
  level = 0,
  onExpand,
  expanded,
}: ItemProps) => {
  const router = useRouter()
  const { user } = useAuth()
  const { create, archive } = useDocumentsApi()
  const bump = useDocumentsRefresh((state) => state.bump)

  const onArchive = (event: React.MouseEvent) => {
    event.stopPropagation()

    if (!id) return
    const promise = archive(id).then(() => {
      bump()
      router.push('/documents')
      return null
    })
    toast.promise(promise, {
      loading: 'Moving to trash...',
      success: 'Note moved to trash!',
      error: 'Failed to move note to trash.',
    })
  }

  const handleExpand = (event: React.MouseEvent) => {
    event.stopPropagation()
    onExpand?.()
  }

  const onCreate = (event: React.MouseEvent) => {
    event.stopPropagation()
    if (!id) return
    const promise = create({
      title: 'Untitled',
      parentDocumentId: id,
    }).then((document) => {
      bump()
      if (!expanded) {
        onExpand?.()
      }
      router.push(`/documents/${document.id}`)
      return document
    })

    toast.promise(promise, {
      loading: 'Creating...',
      success: 'Created!',
      error: 'Failed to create document.',
    })
  }

  const ChevronIcon = expanded ? ChevronDown : ChevronRight

  if (!id) {
    return (
      <button
        type="button"
        onClick={onClick}
        style={{
          paddingLeft: level ? `${level * 12 + 12}px` : '12px',
        }}
        className={cn(
          'group min-h-[27px] text-sm py-1 pr-3 w-full hover:bg-primary/5 flex items-center text-muted-foreground font-medium',
          active && 'bg-primary/5 text-primary',
        )}
      >
        <Icon className="mr-2 h-[18px] shrink-0 text-muted-foreground" />
        <span className="truncate">{label}</span>
        {isSearch && (
          <kbd className="pointer-events-none ml-auto inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
            <span className="text-xs">※</span>K
          </kbd>
        )}
      </button>
    )
  }

  return (
    <div
      style={{
        paddingLeft: level ? `${level * 12 + 12}px` : '12px',
      }}
      className={cn(
        'group min-h-[27px] text-sm py-1 pr-3 w-full hover:bg-primary/5 flex items-center text-muted-foreground font-medium',
        active && 'bg-primary/5 text-primary',
      )}
    >
      <button
        type="button"
        aria-label={expanded ? '收起' : '展开'}
        className="mr-1 h-full rounded-sm hover:bg-neutral-300 dark:hover:bg-neutral-600"
        onClick={handleExpand}
      >
        <ChevronIcon className="h-4 w-4 shrink-0 text-muted-foreground/50"></ChevronIcon>
      </button>
      {documentIcon ? (
        <div className="mr-2 shrink-0 text-[18px]">{documentIcon}</div>
      ) : (
        <Icon className="mr-2 h-[18px] shrink-0 text-muted-foreground" />
      )}
      <button type="button" onClick={onClick} className="min-w-0 flex-1 truncate text-left">
        {label}
      </button>
      {isSearch && (
        <kbd className="pointer-events-none ml-auto inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
          <span className="text-xs">※</span>K
        </kbd>
      )}
      <div className="ml-auto flex items-center gap-x-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              aria-label="More"
              className="ml-auto h-full rounded-sm opacity-0 hover:bg-neutral-300 group-hover:opacity-100 dark:hover:bg-neutral-600"
            >
              <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-60" align="start" side="right" forceMount>
            <DropdownMenuItem onClick={onArchive}>
              <Trash className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <div className="p-2 text-xs text-muted-foreground">
              Last edited by: {user?.name ?? user?.email}{' '}
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
        <button
          type="button"
          aria-label="Create"
          onClick={onCreate}
          className="ml-auto h-full rounded-sm opacity-0 hover:bg-neutral-300 group-hover:opacity-100 dark:hover:bg-neutral-600"
        >
          <Plus className="h-4 w-4 text-muted-foreground" />
        </button>
      </div>
    </div>
  )
}

Item.Skeleton = function ItemSkeleton({ level }: { level: number }) {
  return (
    <div
      style={{
        paddingLeft: level ? `${level * 12 + 25}px` : '12px',
      }}
      className="flex gap-x-2 py-[3px]"
    >
      <Skeleton className="h-4 w-4" />
      <Skeleton className="h-4 w-[30%]" />
    </div>
  )
}

export default Item
