import { useCallback, useEffect, useState } from 'react'

import { Document } from '@/types/document'

import { useDocumentsApi } from './use-documents-api'
import { useDocumentsRefresh } from './use-documents-refresh'

type ListType = 'sidebar' | 'search' | 'trash'

type UseDocumentsListOptions = {
  type: ListType
  parentDocumentId?: string | null
}

export const useDocumentsList = ({ type, parentDocumentId }: UseDocumentsListOptions) => {
  const { getSidebar, getSearch, getTrash } = useDocumentsApi()
  const refreshKey = useDocumentsRefresh((state) => state.refreshKey)
  const [documents, setDocuments] = useState<Document[] | undefined>(undefined)
  const [isLoading, setIsLoading] = useState(false)

  const fetchDocuments = useCallback(async () => {
    setIsLoading(true)
    try {
      const data =
        type === 'sidebar'
          ? await getSidebar(parentDocumentId ?? undefined)
          : type === 'trash'
            ? await getTrash()
            : await getSearch()
      setDocuments(data)
    } catch {
      setDocuments([])
    } finally {
      setIsLoading(false)
    }
  }, [getSearch, getSidebar, getTrash, parentDocumentId, type])

  useEffect(() => {
    fetchDocuments()
  }, [fetchDocuments, refreshKey])

  return { documents, isLoading, refetch: fetchDocuments }
}
