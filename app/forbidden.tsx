import Link from "next/link"
import { ShieldAlert } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function ForbiddenPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 px-4">
      <ShieldAlert className="size-16 text-destructive/60" />
      <div className="text-center">
        <h1 className="text-4xl font-bold text-foreground">403</h1>
        <p className="mt-2 text-lg text-muted-foreground">
          접근 권한이 없습니다
        </p>
        <p className="mt-1 text-sm text-text-secondary">
          이 페이지에 접근하려면 관리자에게 권한을 요청하세요.
        </p>
      </div>
      <Button asChild>
        <Link href="/">대시보드로 돌아가기</Link>
      </Button>
    </div>
  )
}
