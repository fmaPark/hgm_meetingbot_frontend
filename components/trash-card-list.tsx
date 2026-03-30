"use client"

import { Eye, RotateCcw } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { StatusBadge } from "@/components/status-badge"
import type { DeletedMeeting } from "@/lib/meeting-types"
import {
  formatRelativeDate,
  formatDeletedRelative,
  isViewable,
  isClickable,
} from "@/lib/meeting-types"

type DisplayDeletedMeeting = DeletedMeeting & { _fading?: boolean }

interface TrashCardListProps {
  meetings: DisplayDeletedMeeting[]
  onRestore: (meeting: DeletedMeeting) => void
  onView: (meeting: DeletedMeeting) => void
  loading?: boolean
}

export function TrashCardList({
  meetings,
  onRestore,
  onView,
  loading = false,
}: TrashCardListProps) {
  if (loading) {
    return <TrashCardSkeleton />
  }

  return (
    <div className="flex w-full min-w-0 flex-col gap-2">
      {meetings.map((meeting) => (
        <div
          key={meeting.id}
          className={cn(
            "w-full rounded-lg border border-red-200 bg-card p-4",
            meeting._fading && "animate-fade-out-row"
          )}
          onClick={() => {
            if (isClickable(meeting.status)) onView(meeting)
          }}
          role={isClickable(meeting.status) ? "button" : undefined}
          tabIndex={isClickable(meeting.status) ? 0 : undefined}
          onKeyDown={(e) => {
            if (isClickable(meeting.status) && e.key === "Enter") onView(meeting)
          }}
        >
          {/* Top: Date + Deleted relative + Status Badge */}
          <div className="flex items-center justify-between">
            <span className="text-xs text-text-secondary">
              {formatRelativeDate(meeting.start_time)}
              {meeting.deleted_at && ` · (삭제: ${formatDeletedRelative(meeting.deleted_at)})`}
            </span>
            <StatusBadge status={meeting.status} />
          </div>

          {/* Middle: Project / Part */}
          <h3 className="mt-2 line-clamp-2 font-semibold text-foreground">
            {meeting.project} / {meeting.part}
          </h3>

          {/* Bottom: Info + Actions */}
          <div className="mt-2 flex items-center justify-between">
            <span className="text-xs text-text-secondary">
              {meeting.author_nick}
            </span>

            <div
              className="flex items-center gap-1"
              onClick={(e) => e.stopPropagation()}
            >
              <Button
                variant="ghost"
                size="icon"
                className="size-8 shrink-0"
                aria-label="복구"
                onClick={() => onRestore(meeting)}
              >
                <RotateCcw className="size-4" />
              </Button>
              {isViewable(meeting.status) && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-8 shrink-0"
                  aria-label="상세보기"
                  onClick={() => onView(meeting)}
                >
                  <Eye className="size-4" />
                </Button>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

/* ─── Skeleton ───────────────────────────────────── */

function TrashCardSkeleton() {
  return (
    <div className="flex flex-col gap-2">
      {Array.from({ length: 3 }).map((_, i) => (
        <div
          key={i}
          className="rounded-lg border border-red-200 bg-card p-4"
        >
          <div className="flex items-center justify-between">
            <Skeleton className="h-3 w-32" />
            <Skeleton className="h-5 w-16 rounded-full" />
          </div>
          <Skeleton className="mt-2 h-5 w-3/4" />
          <div className="mt-2 flex items-center justify-between">
            <Skeleton className="h-3 w-40" />
            <div className="flex gap-1">
              <Skeleton className="size-8 rounded" />
              <Skeleton className="size-8 rounded" />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
