import { useCallback } from 'react'

import { useAuthStore } from '@/store/auth-store'
import { AuthUser } from '@/types/auth'

import { useRequest } from './use-request'

type AuthResponse = {
  accessToken: string
  user: AuthUser
}

type LoginPayload = {
  email: string
  password: string
}

type RegisterPayload = {
  email: string
  password: string
  name?: string
}

type UpdateProfilePayload = Partial<{
  name: string | null
  avatarUrl: string | null
}>

export const useAuth = () => {
  const { request } = useRequest()
  const token = useAuthStore((state) => state.token)
  const user = useAuthStore((state) => state.user)
  const isLoading = useAuthStore((state) => state.isLoading)
  const setToken = useAuthStore((state) => state.setToken)
  const setUser = useAuthStore((state) => state.setUser)
  const setLoading = useAuthStore((state) => state.setLoading)
  const clear = useAuthStore((state) => state.clear)

  const isAuthenticated = Boolean(token && user)

  const login = useCallback(
    async (payload: LoginPayload) => {
      const data = await request<AuthResponse>('/auth/login', {
        method: 'POST',
        body: payload,
        auth: false,
      })
      setToken(data.accessToken)
      setUser(data.user)
      return data
    },
    [request, setToken, setUser],
  )

  const register = useCallback(
    async (payload: RegisterPayload) => {
      const data = await request<AuthResponse>('/auth/register', {
        method: 'POST',
        body: payload,
        auth: false,
      })
      setToken(data.accessToken)
      setUser(data.user)
      return data
    },
    [request, setToken, setUser],
  )

  const refresh = useCallback(async () => {
    if (!token) {
      return null
    }
    const data = await request<AuthUser>('/auth/me')
    setUser(data)
    return data
  }, [request, setUser, token])

  const updateProfile = useCallback(
    async (payload: UpdateProfilePayload) => {
      const data = await request<AuthUser>('/auth/me', { method: 'PATCH', body: payload })
      setUser(data)
      return data
    },
    [request, setUser],
  )

  const logout = useCallback(() => {
    clear()
  }, [clear])

  return {
    token,
    user,
    isLoading,
    isAuthenticated,
    login,
    register,
    refresh,
    updateProfile,
    logout,
    setLoading,
  }
}
