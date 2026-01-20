'use client'

import dynamic from 'next/dynamic'
import { useParams } from 'next/navigation'
import { useMemo } from 'react'
import React from 'react'

import Cover from '@/components/cover'
import { Toolbar } from '@/components/toolbar'
import { Skeleton } from '@/components/ui/skeleton'
import { useDocument } from '@/hooks/use-document'
import { useDocumentsApi } from '@/hooks/use-documents-api'

const DocumentIdPage = () => {
  const params = useParams()
  const Editor = useMemo(() => dynamic(() => import('@/components/editor'), { ssr: false }), [])

  const { document } = useDocument(params.documentId as string)
  const { update } = useDocumentsApi()

  const onChange = async (content: string) => {
    await update(params.documentId as string, { content })
  }

  if (document === undefined) {
    return (
      <div>
        <Cover.Skeleton></Cover.Skeleton>
        <div className="mx-auto mt-10 md:max-w-3xl lg:max-w-4xl">
          <div className="space-y-4 pl-8 pt-4">
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
      <Cover url={document.coverImage ?? undefined}></Cover>
      <div className="mx-auto md:max-w-3xl lg:max-w-4xl">
        <Toolbar initialData={document}></Toolbar>
        <Editor onChange={onChange} initialContent={document.content} />
      </div>
    </div>
  )
}

export default DocumentIdPage
