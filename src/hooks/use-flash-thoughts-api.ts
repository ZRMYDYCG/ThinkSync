import { useCallback } from 'react'

import { FlashThought, FlashThoughtComment } from '@/types/flash-thought'

import { useRequest } from './use-request'

type CreateFlashThoughtPayload = {
  content: string
  images?: string[]
}

type ToggleLikeResponse = {
  likedByMe: boolean
  likeCount: number
}

type CreateCommentPayload = {
  content: string
  parentId?: string
}

export const useFlashThoughtsApi = () => {
  const { request } = useRequest()

  const list = useCallback(
    (filter?: 'all' | 'following' | 'mine') =>
      request<FlashThought[]>('/flash-thoughts', { params: { filter } }),
    [request],
  )

  const create = useCallback(
    (payload: CreateFlashThoughtPayload) =>
      request<FlashThought>('/flash-thoughts', { method: 'POST', body: payload }),
    [request],
  )

  const toggleLike = useCallback(
    (id: string) => request<ToggleLikeResponse>(`/flash-thoughts/${id}/like`, { method: 'POST' }),
    [request],
  )

  const addComment = useCallback(
    (id: string, payload: CreateCommentPayload) =>
      request<FlashThoughtComment>(`/flash-thoughts/${id}/comments`, {
        method: 'POST',
        body: payload,
      }),
    [request],
  )

  return { list, create, toggleLike, addComment }
}
