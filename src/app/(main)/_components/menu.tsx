'use client'

import { MoreHorizontalIcon, Trash } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useRouter } from 'next/navigation'
import React from 'react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import { Skeleton } from '@/components/ui/skeleton'
import { useAuth } from '@/hooks/use-auth'
import { useDocumentsApi } from '@/hooks/use-documents-api'
import { useDocumentsRefresh } from '@/hooks/use-documents-refresh'

interface MenuProps {
  documentId: string
}

const Menu = ({ documentId }: MenuProps) => {
  const router = useRouter()
  const { user } = useAuth()
  const { archive } = useDocumentsApi()
  const bump = useDocumentsRefresh((state) => state.bump)

  const tGlobal = useTranslations('Global')
  const tTips = useTranslations('App.tips')
  const tToast = useTranslations('App.toast')

  const onArchive = () => {
    const promise = archive(documentId).then(() => {
      bump()
      return true
    })

    toast.promise(promise, {
      loading: tToast('Archiving'),
      success: tToast('DocumentArchived'),
      error: tToast('ArchiveFailed'),
    })

    router.push('/documents')
  }
  return (
    <div>
      <DropdownMenu>
        <DropdownMenuTrigger>
          <Button size="sm" variant="ghost" className="h-4 w-4">
            <MoreHorizontalIcon />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-60" align="end" alignOffset={8} forceMount>
          <DropdownMenuItem onClick={onArchive}>
            <Trash className="mr-2 h-4 w-4" />
            {tGlobal('delete')}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <div className="p-2 text-xs text-muted-foreground">
            {tTips('LastEditedBy')}: {user?.name ?? user?.email}
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}

Menu.Skeleton = function MenuSkeleton() {
  return <Skeleton className="h-4 w-10" />
}

export default Menu
