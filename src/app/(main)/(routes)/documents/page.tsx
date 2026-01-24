'use client'

import { PlusCircle } from 'lucide-react'
import { useTranslations } from 'next-intl'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import React from 'react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { useAuth } from '@/hooks/use-auth'
import { useDocumentsApi } from '@/hooks/use-documents-api'
import { useDocumentsRefresh } from '@/hooks/use-documents-refresh'

const DocumentsPage = () => {
  const { user } = useAuth()
  const router = useRouter()
  const { create } = useDocumentsApi()
  const bump = useDocumentsRefresh((state) => state.bump)
  const tDocumentsPage = useTranslations('App.documentsPage')
  const tToolbar = useTranslations('App.toolbar')
  const ownerLabel = user?.name ?? user?.email ?? tDocumentsPage('your')

  const onCreate = () => {
    const promise = create({
      title: tToolbar('untitled'),
    }).then((document) => {
      bump()
      router.push(`/documents/${document.id}`)
      return document
    })

    toast.promise(promise, {
      loading: tDocumentsPage('creatingNote'),
      success: tDocumentsPage('noteCreated'),
      error: tDocumentsPage('createNoteFailed'),
    })
  }

  return (
    <div className="flex h-full flex-col items-center justify-center space-y-4">
      <Image
        src="/empty.png"
        alt={tDocumentsPage('emptyAlt')}
        width="300"
        height="300"
        className="dark:hidden"
      ></Image>
      <Image
        src="/empty-dark.png"
        alt={tDocumentsPage('emptyAlt')}
        width="300"
        height="300"
        className="hidden dark:block"
      ></Image>
      <h2 className="text-lg font-medium">{tDocumentsPage('welcome', { name: ownerLabel })}</h2>
      <Button onClick={onCreate}>
        <PlusCircle className="mr-2 h-4 w-4" />
        {tDocumentsPage('createNote')}
      </Button>
    </div>
  )
}

export default DocumentsPage
