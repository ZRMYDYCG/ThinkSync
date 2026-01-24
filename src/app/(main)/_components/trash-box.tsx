'use client'

import { Search, Trash, Undo } from 'lucide-react'
import { useRouter, useParams } from 'next/navigation'
import React, { useState } from 'react'
import { toast } from 'sonner'

import ConfirmModal from '@/components/modals/confirm-modal'
import { Spinner } from '@/components/spinner'
import { Input } from '@/components/ui/input'
import { useDocumentsApi } from '@/hooks/use-documents-api'
import { useDocumentsList } from '@/hooks/use-documents-list'
import { useDocumentsRefresh } from '@/hooks/use-documents-refresh'

const TrashBox = () => {
  const router = useRouter()
  const params = useParams()
  const { documents } = useDocumentsList({ type: 'trash' })
  const { restore, remove } = useDocumentsApi()
  const bump = useDocumentsRefresh((state) => state.bump)

  const [search, setSearch] = useState('')

  const filteredDocuments = documents?.filter((document) => {
    return document.title.toLowerCase().includes(search.toLowerCase())
  })

  const onClick = (documentId: string) => {
    router.push(`/documents/${documentId}`)
  }

  const onRestore = (event: React.MouseEvent, documentId: string) => {
    event.preventDefault()
    const promise = restore(documentId).then(() => {
      bump()
      return null
    })

    toast.promise(promise, {
      loading: 'Restoring...',
      success: 'Document restored',
      error: 'Error restoring document',
    })
  }

  const onRemove = (documentId: string) => {
    const promise = remove(documentId).then(() => {
      bump()
      return null
    })

    toast.promise(promise, {
      loading: 'Deleting...',
      success: 'Document Deleted',
      error: 'Error deleting document',
    })

    if (params.documentId === documentId) {
      router.push('/documents')
    }
  }

  if (documents === undefined) {
    return (
      <div className="flex h-full items-center justify-center p-4">
        <Spinner size="lg" />
      </div>
    )
  }

  return (
    <div className="text-sm">
      <div className="flex items-center gap-x-1 p-2">
        <Search className="h-4 w-4" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Filter by title..."
          className="bg-secondary h-7 px-2 focus-visible:ring-transparent"
        ></Input>
      </div>
      <div className="mt-2 max-h-80 overflow-y-auto px-1 pb-1">
        <p className="text-muted-foreground hidden pb-2 text-center text-xs last:block">
          No documents found
        </p>
        {filteredDocuments?.map((document) => (
          <div
            key={document.id}
            className="text-primary hover:bg-primary/5 flex w-full items-center justify-between rounded-sm text-sm"
          >
            <button
              type="button"
              onClick={() => onClick(document.id)}
              className="min-w-0 flex-1 truncate pl-2 text-left"
              title={document.title}
            >
              {document.title}
            </button>
            <div className="flex items-center">
              <button
                type="button"
                onClick={(e) => onRestore(e, document.id)}
                className="hover:bg-accent rounded-sm p-2"
                aria-label="Restore"
              >
                <Undo className="text-muted-foreground h-4 w-4" />
              </button>
              <ConfirmModal onConfirm={() => onRemove(document.id)}>
                <button
                  type="button"
                  className="hover:bg-accent rounded-sm p-2"
                  aria-label="Delete"
                >
                  <Trash className="text-muted-foreground h-4 w-4" />
                </button>
              </ConfirmModal>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default TrashBox
