'use client'

import dynamic from 'next/dynamic'
import { useParams } from 'next/navigation'
import React, { useMemo } from 'react'

import Cover from '@/components/cover'
import { Toolbar } from '@/components/toolbar'
import { Skeleton } from '@/components/ui/skeleton'
import { useDocument } from '@/hooks/use-document'

const noop = () => {}

const DocumentIdPage = () => {
  const params = useParams()

  const Editor = useMemo(() => dynamic(() => import('@/components/editor'), { ssr: false }), [])
  const { document } = useDocument(params.documentId as string)

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
      <Cover
        preview
        url={document.coverImage ?? undefined}
        position={document.coverPosition ?? undefined}
      ></Cover>
      <div className="mx-auto md:max-w-3xl lg:max-w-4xl">
        <Toolbar preview initialData={document}></Toolbar>
        <Editor editable={false} onChange={noop} initialContent={document.content} />
      </div>
    </div>
  )
}

export default DocumentIdPage
