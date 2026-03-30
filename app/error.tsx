"use client"

import { useEffect } from "react"
import Link from "next/link"
import { AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error("Route error:", error)
  }, [error])

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 px-4">
      <AlertTriangle className="size-16 text-destructive/60" />
      <div className="text-center">
        <h1 className="text-2xl font-bold text-foreground">
          오류가 발생했습니다
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          페이지를 불러오는 중 문제가 발생했습니다.
        </p>
        {error.digest && (
          <p className="mt-1 font-mono text-xs text-text-secondary">
            오류 코드: {error.digest}
          </p>
        )}
      </div>
      <div className="flex gap-3">
        <Button variant="outline" onClick={reset}>
          다시 시도
        </Button>
        <Button asChild>
          <Link href="/">대시보드로 돌아가기</Link>
        </Button>
      </div>
    </div>
  )
}
