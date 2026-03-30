'use client'

import { Suspense, useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

const ERROR_MESSAGES: Record<string, string> = {
  discord_token_fail: 'Discord 인증 토큰 획득에 실패했습니다. 다시 시도해주세요.',
  no_discord_token: 'Discord 인증이 완료되지 않았습니다. 다시 시도해주세요.',
  discord_user_fail: 'Discord 사용자 정보를 가져오는 데 실패했습니다.',
  no_discord_id: 'Discord 사용자 ID를 찾을 수 없습니다.',
  user_creation_fail: '사용자 생성 또는 업데이트에 실패했습니다.',
  discord_exchange_failed: 'Discord 코드 교환에 실패했습니다. 다시 시도해주세요.',
  no_discord_code: 'Discord 인증 코드를 받지 못했습니다. 다시 시도해주세요.',
  session_expired: '세션이 만료되었습니다. 다시 로그인해주세요.',
}

function LoginForm() {
  const searchParams = useSearchParams()
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    const error = searchParams.get('error')
    if (error) {
      setErrorMessage(ERROR_MESSAGES[error] ?? '알 수 없는 로그인 오류가 발생했습니다.')
    }
  }, [searchParams])

  function handleDiscordLogin() {
    const redirect = searchParams.get('redirect')
    if (redirect) {
      localStorage.setItem('redirectPath', redirect)
    }
    setIsLoading(true)
    window.location.href = '/api/login/discord'
  }

  return (
    <Card className="w-full max-w-[400px] shadow-lg">
      <CardContent className="flex flex-col items-center gap-6 pt-8 pb-8">
        {/* 로고 */}
        <div className="flex flex-col items-center gap-2">
          <div className="flex items-center gap-2">
            <img
              src="/icon.svg"
              alt="HGM Games"
              width={32}
              height={32}
              className="h-8 w-8"
            />
            <span className="text-lg font-semibold text-muted-foreground">
              hgm games.
            </span>
          </div>
          <h1 className="text-xl font-bold text-[#2E7D32]">HGM_Workspace</h1>
        </div>

        {/* 타이틀 */}
        <h2 className="text-2xl font-bold">관리자 로그인</h2>

        {/* 에러 메시지 */}
        {errorMessage && (
          <div className="w-full rounded-md border border-destructive bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {errorMessage}
          </div>
        )}

        {/* Discord 로그인 버튼 */}
        <Button
          onClick={handleDiscordLogin}
          disabled={isLoading}
          className="w-full h-12 text-base font-semibold"
          style={{ backgroundColor: '#5865F2' }}
        >
          {isLoading ? (
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
          ) : (
            <svg
              className="mr-2 h-5 w-5"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
            </svg>
          )}
          디스코드로 로그인
        </Button>
      </CardContent>
    </Card>
  )
}

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 px-4">
      <Suspense fallback={
        <Card className="w-full max-w-[400px] shadow-lg">
          <CardContent className="flex items-center justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </CardContent>
        </Card>
      }>
        <LoginForm />
      </Suspense>
    </div>
  )
}
