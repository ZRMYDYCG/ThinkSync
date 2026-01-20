'use client'

import { useParams } from 'next/navigation'
import React, { useState } from 'react'

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
    if (file) {
      setIsSubmitting(true)
      setFile(file)

      if (params.documentId) {
        await uploadCover(params.documentId as string, file)
        bump()
      }
      onClose()
    }
  }

  return (
    <Dialog open={coverImage.isOpen} onOpenChange={coverImage.onClose}>
      <DialogContent>
        <DialogHeader>
          <h2 className="text-center text-lg font-semibold">Select a cover image</h2>
        </DialogHeader>
        <SingleImageDropzone
          className="w-full outline-none"
          disabled={isSubmitting}
          value={file}
          onChange={onChange}
        />
      </DialogContent>
    </Dialog>
  )
}
