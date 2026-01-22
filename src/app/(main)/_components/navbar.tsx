'use client'

import { useTranslations } from 'next-intl'
import { useParams } from 'next/navigation'
import React from 'react'

import { CollabControl } from '@/components/collab-control'
import { useDocument } from '@/hooks/use-document'
import { useTabsStore } from '@/store/tabs-store'

import Banner from './banner'
import Menu from './menu'
import Publish from './publish'
import Title from './title'

const Navbar = () => {
  const params = useParams()

  const { document } = useDocument(params.documentId as string)
  const openTab = useTabsStore((s) => s.openTab)

  const tTips = useTranslations('App.tips')

  const docId = params.documentId as string

  React.useEffect(() => {
    if (!document) return
    openTab({
      docId: document.id,
      title: document.title,
      icon: document.icon ?? undefined,
      route: `/documents/${document.id}`,
    })
  }, [document, openTab])

  if (document === undefined) {
    return (
      <nav className="flex w-full items-center justify-between bg-background px-3 py-2 dark:bg-[#1F1F1F]">
        <Title.Skeleton />
        <div className="flex items-center gap-x-2">
          <Menu.Skeleton />
        </div>
      </nav>
    )
  }

  if (document === null) {
    return null
  }

  return (
    <>
      <nav className="flex w-full items-center bg-background px-3 py-2 dark:bg-[#1F1F1F]">
        <div className="flex w-full items-center justify-between">
          <Title initialData={document}></Title>
          <div className="flex items-center gap-x-2">
            <span className="text-xs text-muted-foreground">
              {tTips('LastEdited')} {new Date(document.updatedAt).toLocaleString()}
            </span>
            <CollabControl docId={docId} />
            <Publish initialData={document}></Publish>
            <Menu documentId={document.id} />
          </div>
        </div>
      </nav>
      {document.isArchived && <Banner documentId={document.id} />}
    </>
  )
}

export default Navbar
