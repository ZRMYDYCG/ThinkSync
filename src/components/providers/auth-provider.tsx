'use client'

import React, { useEffect } from 'react'

import { useAuth } from '@/hooks/use-auth'

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const { token, refresh, logout, setLoading } = useAuth()

  useEffect(() => {
    let isMounted = true
    const load = async () => {
      setLoading(true)
      if (!token) {
        setLoading(false)
        return
      }
      try {
        await refresh()
      } catch {
        logout()
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    load()

    return () => {
      isMounted = false
    }
  }, [token, refresh, logout, setLoading])

  return <>{children}</>
}
