"use client"

import { MoreHorizontal, Eye, Play, RotateCcw, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Skeleton } from "@/components/ui/skeleton"
import { StatusBadge } from "@/components/status-badge"
import type { Meeting } from "@/lib/meeting-types"
import {
  formatRelativeDate,
  isViewable,
  isSummarizable,
  isRetryable,
  isDeletable,
  isClickable,
} from "@/lib/meeting-types"

interface MeetingCardListProps {
  meetings: Meeting[]
  onView: (meeting: Meeting) => void
  onSummarize: (meeting: Meeting) => void
  onRetry: (meeting: Meeting) => void
  onDelete: (meeting: Meeting) => void
  loading?: boolean
}

export function MeetingCardList({
  meetings,
  onView,
  onSummarize,
  onRetry,
  onDelete,
  loading = false,
}: MeetingCardListProps) {
  if (loading) {
    return <MeetingCardSkeleton />
  }

  return (
    <div className="flex w-full min-w-0 flex-col gap-2">
      {meetings.map((meeting) => (
        <div
          key={meeting.id}
          className="w-full rounded-lg border border-gray-200 bg-card p-4"
          onClick={() => {
            if (isClickable(meeting.status)) onView(meeting)
          }}
          role={isClickable(meeting.status) ? "button" : undefined}
          tabIndex={isClickable(meeting.status) ? 0 : undefined}
          onKeyDown={(e) => {
            if (isClickable(meeting.status) && e.key === "Enter") onView(meeting)
          }}
        >
          {/* Top: Date + Status Badge */}
          <div className="flex items-center justify-between">
            <span className="text-xs text-text-secondary">
              {formatRelativeDate(meeting.date)}
            </span>
            <StatusBadge status={meeting.status} />
          </div>

          {/* Middle: Title */}
          <h3 className="mt-2 line-clamp-2 font-semibold text-foreground">
            {meeting.title}
          </h3>

          {/* Bottom: Info + Actions */}
          <div className="mt-2 flex items-center justify-between">
            <span className="text-xs text-text-secondary">
              {meeting.project}/{meeting.part} · {meeting.host}
            </span>

            {/* Action Menu */}
            {hasAnyAction(meeting) && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-8 shrink-0"
                    aria-label="액션 메뉴"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <MoreHorizontal className="size-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {isSummarizable(meeting.status) && (
                    <DropdownMenuItem onClick={() => onSummarize(meeting)}>
                      <Play className="size-4" />
                      요약하기
                    </DropdownMenuItem>
                  )}
                  {isViewable(meeting.status) && (
                    <DropdownMenuItem onClick={() => onView(meeting)}>
                      <Eye className="size-4" />
                      상세보기
                    </DropdownMenuItem>
                  )}
                  {isRetryable(meeting.status) && (
                    <DropdownMenuItem onClick={() => onRetry(meeting)}>
                      <RotateCcw className="size-4" />
                      재시도
                    </DropdownMenuItem>
                  )}
                  {isDeletable(meeting.status) && (
                    <DropdownMenuItem
                      variant="destructive"
                      onClick={() => onDelete(meeting)}
                    >
                      <Trash2 className="size-4" />
                      삭제
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}

function hasAnyAction(meeting: Meeting): boolean {
  return (
    isSummarizable(meeting.status) ||
    isViewable(meeting.status) ||
    isRetryable(meeting.status) ||
    isDeletable(meeting.status)
  )
}

/* ─── Skeleton ───────────────────────────────────── */

function MeetingCardSkeleton() {
  return (
    <div className="flex flex-col gap-2">
      {Array.from({ length: 5 }).map((_, i) => (
        <div
          key={i}
          className="rounded-lg border border-gray-200 bg-card p-4"
        >
          <div className="flex items-center justify-between">
            <Skeleton className="h-3 w-12" />
            <Skeleton className="h-5 w-16 rounded-full" />
          </div>
          <Skeleton className="mt-2 h-5 w-3/4" />
          <div className="mt-2 flex items-center justify-between">
            <Skeleton className="h-3 w-40" />
            <Skeleton className="size-8 rounded" />
          </div>
        </div>
      ))}
    </div>
  )
}
