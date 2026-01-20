import { useCallback } from 'react'

import { Document } from '@/types/document'

import { useRequest } from './use-request'

type CreateDocumentPayload = {
  title: string
  parentDocumentId?: string | null
}

type UpdateDocumentPayload = Partial<{
  title: string
  content: string
  coverImage: string | null
  coverPosition: number | null
  icon: string | null
  isPublished: boolean
}>

export const useDocumentsApi = () => {
  const { request } = useRequest()

  const getSidebar = useCallback(
    (parentDocumentId?: string | null) =>
      request<Document[]>('/documents', {
        params: { parentDocumentId: parentDocumentId ?? undefined },
      }),
    [request],
  )

  const getSearch = useCallback(() => request<Document[]>('/documents/search'), [request])

  const getTrash = useCallback(() => request<Document[]>('/documents/trash'), [request])

  const getById = useCallback((id: string) => request<Document>(`/documents/${id}`), [request])

  const create = useCallback(
    (payload: CreateDocumentPayload) =>
      request<Document>('/documents', {
        method: 'POST',
        body: payload,
      }),
    [request],
  )

  const update = useCallback(
    (id: string, payload: UpdateDocumentPayload) =>
      request<Document>(`/documents/${id}`, {
        method: 'PATCH',
        body: payload,
      }),
    [request],
  )

  const archive = useCallback(
    (id: string) => request<Document>(`/documents/${id}/archive`, { method: 'POST' }),
    [request],
  )

  const restore = useCallback(
    (id: string) => request<Document>(`/documents/${id}/restore`, { method: 'POST' }),
    [request],
  )

  const remove = useCallback(
    (id: string) => request<Document>(`/documents/${id}`, { method: 'DELETE' }),
    [request],
  )

  const removeIcon = useCallback(
    (id: string) => request<Document>(`/documents/${id}/remove-icon`, { method: 'POST' }),
    [request],
  )

  const removeCover = useCallback(
    (id: string) => request<Document>(`/documents/${id}/remove-cover`, { method: 'POST' }),
    [request],
  )

  const uploadCover = useCallback(
    (id: string, file: File) => {
      const formData = new FormData()
      formData.append('file', file)
      return request<Document>(`/documents/${id}/cover`, {
        method: 'POST',
        body: formData,
      })
    },
    [request],
  )

  return {
    getSidebar,
    getSearch,
    getTrash,
    getById,
    create,
    update,
    archive,
    restore,
    remove,
    removeIcon,
    removeCover,
    uploadCover,
  }
}
