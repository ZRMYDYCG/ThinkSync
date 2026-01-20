import { useCallback } from 'react'

import { useRequest } from './use-request'

const getBaseUrl = () => (process.env.NEXT_PUBLIC_API_BASE_URL ?? '').replace(/\/$/, '')

const normalizeUrl = (url: string) => {
  if (url.startsWith('http')) {
    return url
  }
  const baseUrl = getBaseUrl()
  return baseUrl ? `${baseUrl}${url}` : url
}

export const useUploadsApi = () => {
  const { request } = useRequest()

  const uploadImage = useCallback(
    async (file: File) => {
      const formData = new FormData()
      formData.append('file', file)
      const data = await request<{ url: string }>('/uploads/images', {
        method: 'POST',
        body: formData,
      })
      return normalizeUrl(data.url)
    },
    [request],
  )

  return { uploadImage }
}
