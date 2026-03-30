'use client'

import { useEffect, useState, type ReactNode } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import { useAuthStore } from '@/lib/stores/auth-store'

interface AuthGuardProps {
  children: ReactNode
}

export function AuthGuard({ children }: AuthGuardProps) {
  const router = useRouter()
  const pathname = usePathname()
  const { isAuthenticated, user } = useAuthStore()
  const [isReady, setIsReady] = useState(false)

  useEffect(() => {
    // Zustand persist가 hydration 되기를 기다림
    const unsubscribe = useAuthStore.persist.onFinishHydration(() => {
      setIsReady(true)
    })

    // 이미 hydration이 끝난 경우
    if (useAuthStore.persist.hasHydrated()) {
      setIsReady(true)
    }

    return unsubscribe
  }, [])

  useEffect(() => {
    if (!isReady) return

    if (!isAuthenticated || !user) {
      router.replace(`/login?redirect=${encodeURIComponent(pathname)}`)
    }
  }, [isReady, isAuthenticated, user, router, pathname])

  if (!isReady) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!isAuthenticated || !user) {
    return null
  }

  return <>{children}</>
}
