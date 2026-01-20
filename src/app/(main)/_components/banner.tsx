'use client'

import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

import ConfirmModal from '@/components/modals/confirm-modal'
import { Button } from '@/components/ui/button'
import { useDocumentsApi } from '@/hooks/use-documents-api'
import { useDocumentsRefresh } from '@/hooks/use-documents-refresh'

interface BannerProps {
  documentId: string
}

const Banner = ({ documentId }: BannerProps) => {
  const router = useRouter()

  const { remove, restore } = useDocumentsApi()
  const bump = useDocumentsRefresh((state) => state.bump)

  const onRemove = async () => {
    const promise = remove(documentId).then(() => {
      bump()
    })
    toast.promise(promise, {
      loading: 'Removing...',
      success: 'Removed',
      error: 'Failed to remove',
    })
    router.push('/documents')
  }

  const onRestore = async () => {
    const promise = restore(documentId).then(() => {
      bump()
    })

    toast.promise(promise, {
      loading: 'Restoring...',
      success: 'Restored',
      error: 'Failed to restore',
    })
  }

  return (
    <div className="flex items-center justify-center gap-x-2 bg-rose-500 p-2 text-center text-sm text-white">
      <p>This document is in the trash.</p>
      <Button
        size="sm"
        onClick={onRestore}
        variant="outline"
        className="h-auto border-white bg-transparent p-1 px-2 font-normal text-white hover:bg-primary/5 hover:text-white"
      >
        Restore Document
      </Button>
      <ConfirmModal onConfirm={onRemove}>
        <Button
          size="sm"
          variant="outline"
          className="h-auto border-white bg-transparent p-1 px-2 font-normal text-white hover:bg-primary/5 hover:text-white"
        >
          Delete Forever
        </Button>
      </ConfirmModal>
    </div>
  )
}

export default Banner
