'use client'

import { ChevronsLeft, ChevronsRight } from 'lucide-react'
import { useParams } from 'next/navigation'
import React from 'react'

import { useDocument } from '@/hooks/use-document'

import Banner from './banner'
import Menu from './menu'
import Publish from './publish'
import Title from './title'

interface NavbarProps {
  isCollapsed: boolean
  onResizeWidth: () => void
  onCollapse: () => void
}

const Navbar = ({ isCollapsed, onResizeWidth, onCollapse }: NavbarProps) => {
  const params = useParams()

  const { document } = useDocument(params.documentId as string)

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
      <nav className="flex w-full items-center gap-x-4 bg-background px-3 py-2 dark:bg-[#1F1F1F]">
        {isCollapsed ? (
          <button type="button" onClick={onResizeWidth} aria-label="Expand navigation">
            <ChevronsRight className="h-6 w-6 text-muted-foreground" />
          </button>
        ) : (
          <button type="button" onClick={onCollapse} aria-label="Collapse navigation">
            <ChevronsLeft className="h-6 w-6 text-muted-foreground" />
          </button>
        )}
        <div className="flex w-full items-center justify-between">
          <Title initialData={document}></Title>
          <div className="flex items-center gap-x-2">
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
