'use client'

import { PlusCircle } from 'lucide-react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
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

  const onCreate = () => {
    const promise = create({
      title: 'Untitled',
    }).then((document) => {
      bump()
      router.push(`/documents/${document.id}`)
    })

    toast.promise(promise, {
      loading: 'Creating note...',
      success: 'Note created!',
      error: 'Failed to create note.',
    })
  }

  return (
    <div className="flex h-full flex-col items-center justify-center space-y-4">
      <Image src="/empty.png" alt="Empty" width="300" height="300" className="dark:hidden"></Image>
      <Image
        src="/empty-dark.png"
        alt="Empty"
        width="300"
        height="300"
        className="hidden dark:block"
      ></Image>
      <h2 className="text-lg font-medium">
        Welcome to {user?.name ?? user?.email ?? 'your'}&apos;s ThinkSync
      </h2>
      <Button onClick={onCreate}>
        <PlusCircle className="mr-2 h-4 w-4" />
        Create a note
      </Button>
    </div>
  )
}

export default DocumentsPage
