'use client'

import { FileIcon, Plus } from 'lucide-react'
import { useParams } from 'next/navigation'
import { useRouter } from 'next/navigation'
import React, { useState } from 'react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { useDocumentsApi } from '@/hooks/use-documents-api'
import { useDocumentsList } from '@/hooks/use-documents-list'
import { useDocumentsRefresh } from '@/hooks/use-documents-refresh'
import { Document } from '@/types/document'

import Item from './item'

// 空状态图标组件
const EmptyStateIcon = () => (
  <svg
    width="48"
    height="48"
    viewBox="0 0 48 48"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className="text-muted-foreground/40"
  >
    {/* 文档主体 */}
    <path
      d="M12 8C12 5.79086 13.7909 4 16 4H28L36 12V40C36 42.2091 34.2091 44 32 44H16C13.7909 44 12 42.2091 12 40V8Z"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
    {/* 折角 */}
    <path
      d="M28 4V12H36"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    {/* 内部线条 */}
    <path
      d="M18 22H30"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M18 28H26"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    {/* 装饰性圆点 */}
    <circle cx="34" cy="32" r="2" fill="currentColor" style={{ opacity: 0.6 }} />
    <circle cx="34" cy="38" r="2" fill="currentColor" style={{ opacity: 0.6 }} />
  </svg>
)

interface DocumentListProps {
  parentDocumentId?: string
  level?: number
  data?: Document[]
}

const DocumentList = ({ parentDocumentId, level = 0 }: DocumentListProps) => {
  const params = useParams()
  const router = useRouter()

  const [expanded, setExpanded] = useState<Record<string, boolean>>({})
  const { create } = useDocumentsApi()
  const bump = useDocumentsRefresh((state) => state.bump)

  const onExpand = (documentId: string) => {
    setExpanded((prevExpanded) => ({
      ...prevExpanded,
      [documentId]: !prevExpanded[documentId],
    }))
  }

  const { documents } = useDocumentsList({
    type: 'sidebar',
    parentDocumentId,
  })

  const onRedirect = (documentId: string) => {
    router.push(`/documents/${documentId}`)
  }

  const handleCreate = () => {
    const promise = create({
      title: 'Untitled',
    }).then((document) => {
      bump()
      router.push(`/documents/${document.id}`)
      return document
    })

    toast.promise(promise, {
      loading: 'Creating document...',
      success: 'Document created!',
      error: 'Failed to create document',
    })
  }

  if (documents === undefined) {
    return (
      <>
        <Item.Skeleton level={level} />
        {level === 0 && (
          <>
            <Item.Skeleton level={level} />
            <Item.Skeleton level={level} />
          </>
        )}
      </>
    )
  }

  if (documents.length === 0) {
    if (level > 0) {
      return (
        <p
          style={{
            paddingLeft: level ? `${level * 12 + 25}px` : undefined,
          }}
          className="text-muted-foreground/80 text-sm font-medium"
        >
          No pages inside
        </p>
      )
    }

    return (
      <div className="text-muted-foreground flex h-full min-h-[200px] flex-col items-center justify-center gap-2 px-6 text-center">
        <EmptyStateIcon />
        <div className="space-y-1">
          <p className="text-foreground text-sm font-medium">暂无文档</p>
          <p className="text-muted-foreground/70 text-xs">创建一个新文档开始记录想法</p>
        </div>
        <Button type="button" variant="secondary" size="sm" className="mt-2" onClick={handleCreate}>
          <Plus />
          新建文档
        </Button>
      </div>
    )
  }

  return (
    <>
      {documents.map((document) => (
        <div key={document.id}>
          <Item
            id={document.id}
            onClick={() => onRedirect(document.id)}
            label={document.title}
            icon={FileIcon}
            documentIcon={document.icon ?? undefined}
            active={params.documentId === document.id}
            level={level}
            onExpand={() => onExpand(document.id)}
            expanded={expanded[document.id]}
          ></Item>
          {expanded[document.id] && (
            <DocumentList parentDocumentId={document.id} level={level + 1} />
          )}
        </div>
      ))}
    </>
  )
}

export default DocumentList
