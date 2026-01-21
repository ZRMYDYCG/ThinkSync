'use client'

import { PlusCircle, Search, Settings, Trash } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useParams, usePathname, useRouter } from 'next/navigation'
import React, { useRef, ElementRef, useState, useEffect, useCallback } from 'react'
import { toast } from 'sonner'
import { useMediaQuery } from 'usehooks-ts'

import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover'
import { useDocumentsApi } from '@/hooks/use-documents-api'
import { useDocumentsRefresh } from '@/hooks/use-documents-refresh'
import { useSearch } from '@/hooks/useSearch'
import { useSetting } from '@/hooks/useSetting'
import { cn } from '@/lib/utils'

import DocumentList from './document-list'
import Item from './item'
import Navbar from './navbar'
import { TabBar } from './tab-bar'
import TrashBox from './trash-box'
import UserItem from './user-item'

const Navigation = () => {
  const setting = useSetting()
  const search = useSearch()
  const pathname = usePathname()
  const params = useParams()
  const isMobile = useMediaQuery('(max-width: 768px)')
  const router = useRouter()

  const { create } = useDocumentsApi()
  const bump = useDocumentsRefresh((state) => state.bump)

  const tApp = useTranslations('App')

  const isResizingRef = useRef(false)
  const sidebarRef = useRef<ElementRef<'aside'>>(null)
  const navbarRef = useRef<ElementRef<'div'>>(null)
  const [isResetting, setIsResetting] = useState(true)
  const [isCollapsed, setIsCollapsed] = useState(isMobile)

  const handleMouseDown = (event: React.MouseEvent<HTMLElement, MouseEvent>) => {
    event.preventDefault()
    event.stopPropagation()
    isResizingRef.current = true
    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
  }

  const handleMouseMove = (e: MouseEvent) => {
    if (!isResizingRef.current) return
    let newWidth = e.clientX

    if (newWidth < 240) newWidth = 240
    if (newWidth > 480) newWidth = 480

    if (sidebarRef.current && navbarRef.current) {
      sidebarRef.current.style.width = `${newWidth}px`
      navbarRef.current.style.setProperty('left', `${newWidth}px`)
      navbarRef.current.style.setProperty('width', `calc(100% - ${newWidth}px)`)
    }
  }

  const handleMouseUp = () => {
    isResizingRef.current = false
    document.removeEventListener('mousemove', handleMouseMove)
    document.removeEventListener('mouseup', handleMouseUp)
  }

  const resetWidth = useCallback(() => {
    if (sidebarRef.current && navbarRef.current) {
      setIsCollapsed(false)
      setIsResetting(true)

      sidebarRef.current.style.width = isMobile ? '100%' : '240px'
      navbarRef.current.style.setProperty('width', isMobile ? '0' : 'calc(100% - 240px)')
      navbarRef.current.style.setProperty('left', isMobile ? '100%' : '240px')
      setTimeout(() => setIsResetting(false), 300)
    }
  }, [isMobile])

  const collapse = useCallback(() => {
    if (sidebarRef.current && navbarRef.current) {
      setIsCollapsed(true)
      setIsResetting(true)

      sidebarRef.current.style.width = '0'
      navbarRef.current.style.setProperty('width', '100%')
      navbarRef.current.style.setProperty('left', '0')
      setTimeout(() => setIsResetting(false), 300)
    }
  }, [])

  useEffect(() => {
    if (isMobile) {
      collapse()
    } else {
      resetWidth()
    }
  }, [isMobile, collapse, resetWidth])

  useEffect(() => {
    if (isMobile) {
      collapse()
    }
  }, [pathname, isMobile, collapse])

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

  return (
    <>
      <aside
        ref={sidebarRef}
        className={cn(
          'group/sidebar h-full bg-secondary overflow-hidden relative flex w-60 flex-col z-[99999]',
          isResetting && 'transition-all ease-in-out duration-300',
          isMobile && 'w-0',
        )}
      >
        <div className="shrink-0">
          <UserItem />
          <Item label={tApp('navbar.search')} icon={Search} isSearch onClick={search.onOpen}></Item>
          <Item label={tApp('navbar.setting')} icon={Settings} onClick={setting.onOpen}></Item>
          <Item icon={PlusCircle} label={tApp('navbar.newDocument')} onClick={handleCreate} />
        </div>
        <div className="mt-4 min-h-0 flex-1 overflow-y-auto">
          <DocumentList />
        </div>
        <div className="shrink-0">
          <Popover>
            <PopoverTrigger asChild className="mt-4 w-full">
              <Item label={tApp('navbar.trash')} icon={Trash}></Item>
            </PopoverTrigger>
            <PopoverContent className="w-72 p-0" side={isMobile ? 'bottom' : 'right'}>
              <TrashBox />
            </PopoverContent>
          </Popover>
        </div>
        <button
          type="button"
          onMouseDown={handleMouseDown}
          onClick={resetWidth}
          aria-label="Resize sidebar"
          className="absolute right-0 top-0 h-full w-1 cursor-ew-resize bg-primary/10 opacity-0 transition group-hover/sidebar:opacity-100"
        ></button>
      </aside>
      <div
        ref={navbarRef}
        className={cn(
          'absolute top-0 z-[99999] left-60 w-[calc(100%-240px)]',
          isResetting && 'transition-all ease-in-out duration-300',
          isMobile && 'left-0 w-full',
        )}
      >
        <TabBar isCollapsed={isCollapsed} onExpandNav={resetWidth} onCollapseNav={collapse} />
        {params.documentId ? <Navbar /> : <nav className="w-full bg-transparent px-3 py-2" />}
      </div>
    </>
  )
}

export default Navigation
