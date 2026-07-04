'use client'

import dynamic from 'next/dynamic'
import { useParams } from 'next/navigation'
import React, { useEffect, useMemo, useRef } from 'react'

import Cover from '@/components/cover'
import { Toolbar } from '@/components/toolbar'
import { Skeleton } from '@/components/ui/skeleton'
import { useDocument } from '@/hooks/use-document'
import { useDocumentsApi } from '@/hooks/use-documents-api'
import { useTabsStore } from '@/store/tabs-store'

const DocumentIdPage = () => {
  const params = useParams()
  const Editor = useMemo(() => dynamic(() => import('@/components/editor'), { ssr: false }), [])

  const docId = params.documentId as string
  const { document } = useDocument(docId)
  const { update } = useDocumentsApi()
  const setDirty = useTabsStore((s) => s.setDirty)

  const contentRef = useRef<string | null>(null)
  const changeSeqRef = useRef(0)

  useEffect(() => {
    contentRef.current = document?.content ?? null
  }, [document?.content])

  useEffect(() => {
    const handler = async (event: Event) => {
      const e = event as CustomEvent<{ docId?: string }>
      if (!e.detail?.docId || e.detail.docId !== docId) return
      if (!contentRef.current) return
      const seq = ++changeSeqRef.current
      setDirty(docId, true)
      await update(docId, { content: contentRef.current })
      if (changeSeqRef.current === seq) setDirty(docId, false)
    }
    window.addEventListener('thinksync:tab-save-request', handler)
    return () => window.removeEventListener('thinksync:tab-save-request', handler)
  }, [docId, setDirty, update])

  const onChange = async (content: string) => {
    contentRef.current = content
    const seq = ++changeSeqRef.current
    setDirty(docId, true)
    await update(docId, { content })
    if (changeSeqRef.current === seq) setDirty(docId, false)
  }

  if (document === undefined) {
    return (
      <div>
        <Cover.Skeleton></Cover.Skeleton>
        <div className="mx-auto mt-10 md:max-w-3xl lg:max-w-4xl">
          <div className="space-y-4 pt-4 pl-8">
            <Skeleton className="h-14 w-[80%]"></Skeleton>
            <Skeleton className="h-10 w-[60%]"></Skeleton>
            <Skeleton className="h-8 w-[50%]"></Skeleton>
            <Skeleton className="h-4 w-[40%]"></Skeleton>
            <Skeleton className="h-2 w-[30%]"></Skeleton>
          </div>
        </div>
      </div>
    )
  }

  if (document === null) {
    return null
  }

  return (
    <div className="pb-40">
      <Cover
        url={document.coverImage ?? undefined}
        position={document.coverPosition ?? undefined}
      ></Cover>
      <div className="mx-auto md:max-w-3xl lg:max-w-4xl">
        <div className="relative">
          <Toolbar initialData={document}></Toolbar>
        </div>
        <Editor key={document.id} onChange={onChange} initialContent={document.content} />
      </div>
    </div>
  )
}

export default DocumentIdPage
