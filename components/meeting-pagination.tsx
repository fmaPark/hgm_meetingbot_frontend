"use client"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

interface MeetingPaginationProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
}

export function MeetingPagination({
  currentPage,
  totalPages,
  onPageChange,
}: MeetingPaginationProps) {
  if (totalPages <= 1) return null

  const pages = getPageNumbers(currentPage, totalPages)

  return (
    <nav
      className="flex items-center justify-center gap-1 py-4"
      aria-label="페이지 네비게이션"
    >
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="h-8 px-3 text-xs"
      >
        이전
      </Button>

      {pages.map((page, idx) =>
        page === "..." ? (
          <span
            key={`ellipsis-${idx}`}
            className="flex size-8 items-center justify-center text-xs text-text-secondary"
          >
            ...
          </span>
        ) : (
          <Button
            key={page}
            variant={page === currentPage ? "default" : "outline"}
            size="sm"
            onClick={() => onPageChange(page as number)}
            className={cn(
              "size-8 p-0 text-xs",
              page === currentPage && "pointer-events-none"
            )}
          >
            {page}
          </Button>
        )
      )}

      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="h-8 px-3 text-xs"
      >
        다음
      </Button>
    </nav>
  )
}

/**
 * Generate page numbers array with max 5 visible + ellipsis.
 * E.g. [1, 2, 3, 4, 5], [1, "...", 4, 5, 6, "...", 10]
 */
function getPageNumbers(
  current: number,
  total: number
): (number | "...")[] {
  if (total <= 5) {
    return Array.from({ length: total }, (_, i) => i + 1)
  }

  const pages: (number | "...")[] = []

  if (current <= 3) {
    pages.push(1, 2, 3, 4, "...", total)
  } else if (current >= total - 2) {
    pages.push(1, "...", total - 3, total - 2, total - 1, total)
  } else {
    pages.push(1, "...", current - 1, current, current + 1, "...", total)
  }

  return pages
}
