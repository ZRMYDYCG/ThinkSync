'use client'

import { useEffect } from 'react'

declare global {
  interface Window {
    reactScan?: (options: { enabled: boolean; showToolbar: boolean }) => void
  }
}

export function ReactScan() {
  useEffect(() => {
    if (process.env.NODE_ENV !== 'development') {
      return
    }

    if (typeof window === 'undefined') {
      return
    }

    const startScan = () => {
      const reactScan = window.reactScan

      if (typeof reactScan !== 'function') {
        console.warn('[react-scan] window.reactScan is not a function')
        return
      }

      try {
        reactScan({
          enabled: true,
          showToolbar: true,
        })
      } catch (error) {
        console.warn('[react-scan] failed to start scan via CDN', error)
      }
    }

    if (typeof window.reactScan === 'function') {
      startScan()
      return
    }

    const onReady = () => startScan()
    window.addEventListener('reactScanReady', onReady)

    const interval = window.setInterval(() => {
      if (typeof window.reactScan === 'function') {
        window.clearInterval(interval)
        window.removeEventListener('reactScanReady', onReady)
        startScan()
      }
    }, 100)

    return () => {
      window.removeEventListener('reactScanReady', onReady)
      window.clearInterval(interval)
    }
  }, [])

  return null
}
