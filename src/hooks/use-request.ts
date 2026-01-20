import { useCallback } from 'react'

import { useAuthStore } from '@/store/auth-store'

type RequestOptions = {
  method?: string
  body?: unknown
  headers?: HeadersInit
  params?: Record<string, string | number | boolean | null | undefined>
  auth?: boolean
  signal?: AbortSignal
}

type ApiResponse<T> = {
  success: boolean
  data?: T
  message?: string
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:3000'

const buildUrl = (path: string, params?: RequestOptions['params']) => {
  const isAbsolute = /^https?:\/\//i.test(path)
  const url = isAbsolute ? new URL(path) : new URL(path, API_BASE_URL)
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value === undefined || value === null) return
      url.searchParams.set(key, String(value))
    })
  }
  return url.toString()
}

export const useRequest = () => {
  const token = useAuthStore((state) => state.token)

  const request = useCallback(
    async <T>(path: string, options: RequestOptions = {}) => {
      const url = buildUrl(path, options.params)
      const headers = new Headers(options.headers)
      const shouldAuth = options.auth !== false

      if (shouldAuth && token) {
        headers.set('Authorization', `Bearer ${token}`)
      }

      let body: BodyInit | undefined
      if (options.body instanceof FormData) {
        body = options.body
      } else if (options.body !== undefined) {
        headers.set('Content-Type', 'application/json')
        body = JSON.stringify(options.body)
      }

      const response = await fetch(url, {
        method: options.method ?? (body ? 'POST' : 'GET'),
        headers,
        body,
        signal: options.signal,
      })

      const contentType = response.headers.get('content-type') ?? ''
      const isJson = contentType.includes('application/json')
      const payload = (isJson ? await response.json() : null) as ApiResponse<T> | null

      if (!response.ok) {
        const message = payload?.message ?? `Request failed with status ${response.status}`
        throw new Error(message)
      }

      if (payload && typeof payload === 'object' && 'success' in payload) {
        if (!payload.success) {
          throw new Error(payload.message ?? 'Request failed')
        }
        return payload.data as T
      }

      return payload as T
    },
    [token],
  )

  return { request }
}
