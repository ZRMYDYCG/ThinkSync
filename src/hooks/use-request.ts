'use client'

import { useCallback } from 'react'

import { defaultLocale } from '@/i18n/config'
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

type ApiErrorResponse = {
  success?: boolean
  message?: string
  errors?: string[]
  statusCode?: number
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
  const getLocaleFromCookie = () => {
    if (typeof document === 'undefined') return defaultLocale
    const match = document.cookie.match(/(?:^|; )NEXT_LOCALE=([^;]+)/)
    return (match?.[1] ?? defaultLocale) as string
  }

  const request = useCallback(
    async <T>(path: string, options: RequestOptions = {}) => {
      const url = buildUrl(path, options.params)
      const headers = new Headers(options.headers)
      const shouldAuth = options.auth !== false

      const locale = getLocaleFromCookie()
      if (!headers.has('Accept-Language')) {
        headers.set('Accept-Language', locale)
      }
      if (!headers.has('X-Locale')) {
        headers.set('X-Locale', locale)
      }

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
      const payload = (isJson ? await response.json() : null) as
        | ApiResponse<T>
        | ApiErrorResponse
        | null

      if (!response.ok) {
        const baseMessage = payload?.message ?? `Request failed with status ${response.status}`
        const errors = Array.isArray((payload as ApiErrorResponse | null)?.errors)
          ? (payload as ApiErrorResponse).errors
          : null
        throw new Error(errors?.length ? `${baseMessage}: ${errors.join('、')}` : baseMessage)
      }

      if (payload && typeof payload === 'object' && 'success' in payload) {
        if (!payload.success) {
          throw new Error(payload.message ?? 'Request failed')
        }
        if ('data' in payload) {
          return (payload as ApiResponse<T>).data as T
        }
        return payload as T
      }

      return payload as T
    },
    [token],
  )

  return { request }
}
