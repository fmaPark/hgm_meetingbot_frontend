'use client'

import { Suspense, useEffect, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import { authApi } from '@/lib/api'
import { useAuthStore } from '@/lib/stores/auth-store'

function CallbackHandler() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const setAuth = useAuthStore((s) => s.setAuth)
  const hasRun = useRef(false)

  useEffect(() => {
    if (hasRun.current) return
    hasRun.current = true

    const code = searchParams.get('code')
    const redirectPath = localStorage.getItem('redirectPath') || '/dashboard'
    localStorage.removeItem('redirectPath')

    if (!code) {
      router.replace('/login?error=no_discord_code')
      return
    }

    authApi
      .exchangeDiscordCode({ code })
      .then(({ access_token, user }) => {
        setAuth(user, access_token, '')
        router.replace(redirectPath)
      })
      .catch(() => {
        router.replace('/login?error=discord_exchange_failed')
      })
  }, [searchParams, router, setAuth])

  return null
}

function LoadingSpinner() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-muted-foreground" />
        <p className="text-lg text-muted-foreground">로그인 처리 중...</p>
      </div>
    </div>
  )
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <LoadingSpinner />
      <CallbackHandler />
    </Suspense>
  )
}
