import Link from "next/link"
import { FileQuestion } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function NotFoundPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 px-4">
      <FileQuestion className="size-16 text-muted-foreground" />
      <div className="text-center">
        <h1 className="text-4xl font-bold text-foreground">404</h1>
        <p className="mt-2 text-lg text-muted-foreground">
          페이지를 찾을 수 없습니다
        </p>
        <p className="mt-1 text-sm text-text-secondary">
          요청하신 페이지가 존재하지 않거나 이동되었습니다.
        </p>
      </div>
      <Button asChild>
        <Link href="/">대시보드로 돌아가기</Link>
      </Button>
    </div>
  )
}
