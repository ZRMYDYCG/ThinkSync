'use client'

import { useParams } from 'next/navigation'
import React, { useState } from 'react'
import { toast } from 'sonner'

import { Dialog, DialogContent, DialogHeader } from '@/components/ui/dialog'
import { useCoverImage } from '@/hooks/use-cover-image'
import { useDocumentsApi } from '@/hooks/use-documents-api'
import { useDocumentsRefresh } from '@/hooks/use-documents-refresh'

import { SingleImageDropzone } from '../single-image-dropzone'

export const CoverImageModal = () => {
  const params = useParams()
  const { uploadCover } = useDocumentsApi()
  const bump = useDocumentsRefresh((state) => state.bump)
  const [file, setFile] = useState<File>()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const coverImage = useCoverImage()

  const onClose = () => {
    setFile(undefined)
    setIsSubmitting(false)
    coverImage.onClose()
  }

  const onChange = async (file?: File) => {
    if (!file) return
    if (!params.documentId) {
      toast.error('缺少 documentId，无法上传封面')
      return
    }

    setIsSubmitting(true)
    setFile(file)
    try {
      await uploadCover(params.documentId as string, file)
      bump()
      onClose()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : '封面上传失败')
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={coverImage.isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <h2 className="text-center text-lg font-semibold">Select a cover image</h2>
        </DialogHeader>
        <SingleImageDropzone
          className="w-full outline-none"
          disabled={isSubmitting}
          value={file}
          dropzoneOptions={{
            maxFiles: 1,
            maxSize: 5 * 1024 * 1024,
            accept: { 'image/*': [] },
          }}
          onChange={onChange}
        />
      </DialogContent>
    </Dialog>
  )
}
