import { useCallback, useEffect, useState } from 'react'

import { Document } from '@/types/document'

import { useDocumentsApi } from './use-documents-api'
import { useDocumentsRefresh } from './use-documents-refresh'

export const useDocument = (documentId?: string) => {
  const { getById } = useDocumentsApi()
  const refreshKey = useDocumentsRefresh((state) => state.refreshKey)
  const [document, setDocument] = useState<Document | null | undefined>(undefined)
  const [isLoading, setIsLoading] = useState(false)

  const fetchDocument = useCallback(async () => {
    if (!documentId) {
      setDocument(null)
      setIsLoading(false)
      return
    }
    setIsLoading(true)
    try {
      const data = await getById(documentId)
      setDocument(data)
    } catch {
      setDocument(null)
    } finally {
      setIsLoading(false)
    }
  }, [documentId, getById])

  useEffect(() => {
    fetchDocument()
  }, [fetchDocument, refreshKey])

  return { document, isLoading, refetch: fetchDocument }
}
