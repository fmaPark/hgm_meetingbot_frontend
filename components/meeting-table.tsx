"use client"

import { ChevronUp, ChevronDown, Eye, Play, RotateCcw, Trash2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"
import { StatusBadge } from "@/components/status-badge"
import type { Meeting, SortConfig, SortField } from "@/lib/meeting-types"
import {
  formatRelativeDate,
  isViewable,
  isSummarizable,
  isRetryable,
  isDeletable,
  isClickable,
} from "@/lib/meeting-types"

interface MeetingTableProps {
  meetings: Meeting[]
  sort: SortConfig
  onSortChange: (field: SortField) => void
  onView: (meeting: Meeting) => void
  onSummarize: (meeting: Meeting) => void
  onRetry: (meeting: Meeting) => void
  onDelete: (meeting: Meeting) => void
  loading?: boolean
}

const SORTABLE_COLUMNS: { field: SortField; label: string; width: string }[] = [
  { field: "date", label: "날짜", width: "w-[120px]" },
  { field: "project", label: "프로젝트", width: "w-[140px]" },
  { field: "part", label: "파트", width: "w-[120px]" },
]

export function MeetingTable({
  meetings,
  sort,
  onSortChange,
  onView,
  onSummarize,
  onRetry,
  onDelete,
  loading = false,
}: MeetingTableProps) {
  if (loading) {
    return <MeetingTableSkeleton />
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-border bg-card">
      <Table className="w-full">
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            {SORTABLE_COLUMNS.map((col) => (
              <TableHead
                key={col.field}
                className={cn(col.width, "cursor-pointer select-none hover:bg-gray-50")}
                onClick={() => onSortChange(col.field)}
              >
                <span className="inline-flex items-center gap-1">
                  {col.label}
                  <SortIndicator field={col.field} sort={sort} />
                </span>
              </TableHead>
            ))}
            <TableHead className="min-w-0">제목</TableHead>
            <TableHead className="w-[100px]">주최자</TableHead>
            <TableHead
              className="w-[100px] cursor-pointer select-none hover:bg-gray-50"
              onClick={() => onSortChange("status")}
            >
              <span className="inline-flex items-center gap-1">
                상태
                <SortIndicator field="status" sort={sort} />
              </span>
            </TableHead>
            <TableHead className="w-[140px] text-right">액션</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {meetings.map((meeting) => (
            <TableRow
              key={meeting.id}
              className={cn(
                isClickable(meeting.status) && "cursor-pointer hover:bg-gray-50"
              )}
              onClick={() => {
                if (isClickable(meeting.status)) onView(meeting)
              }}
            >
              <TableCell className="text-text-secondary">
                {formatRelativeDate(meeting.date)}
              </TableCell>
              <TableCell>{meeting.project}</TableCell>
              <TableCell>{meeting.part}</TableCell>
              <TableCell className="max-w-0">
                <span className="block truncate">{meeting.title}</span>
              </TableCell>
              <TableCell>{meeting.host}</TableCell>
              <TableCell>
                <StatusBadge status={meeting.status} />
              </TableCell>
              <TableCell className="text-right">
                <MeetingActions
                  meeting={meeting}
                  onView={onView}
                  onSummarize={onSummarize}
                  onRetry={onRetry}
                  onDelete={onDelete}
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

/* ─── Sort Indicator ─────────────────────────────── */

function SortIndicator({ field, sort }: { field: SortField; sort: SortConfig }) {
  if (sort.field !== field) {
    return <span className="inline-flex w-4" />
  }
  return sort.direction === "asc" ? (
    <ChevronUp className="size-4" />
  ) : (
    <ChevronDown className="size-4" />
  )
}

/* ─── Action Buttons ─────────────────────────────── */

interface MeetingActionsProps {
  meeting: Meeting
  onView: (meeting: Meeting) => void
  onSummarize: (meeting: Meeting) => void
  onRetry: (meeting: Meeting) => void
  onDelete: (meeting: Meeting) => void
}

function MeetingActions({
  meeting,
  onView,
  onSummarize,
  onRetry,
  onDelete,
}: MeetingActionsProps) {
  return (
    <div
      className="flex items-center justify-end gap-1"
      onClick={(e) => e.stopPropagation()}
    >
      {isSummarizable(meeting.status) && (
        <Button
          size="sm"
          variant="default"
          className="h-7 gap-1 px-2 text-xs"
          onClick={() => onSummarize(meeting)}
        >
          <Play className="size-3" />
          요약하기
        </Button>
      )}
      {isViewable(meeting.status) && (
        <Button
          size="sm"
          variant="outline"
          className="h-7 gap-1 px-2 text-xs"
          onClick={() => onView(meeting)}
        >
          <Eye className="size-3" />
          상세보기
        </Button>
      )}
      {isRetryable(meeting.status) && (
        <Button
          size="sm"
          variant="default"
          className="h-7 gap-1 px-2 text-xs"
          onClick={() => onRetry(meeting)}
        >
          <RotateCcw className="size-3" />
          재시도
        </Button>
      )}
      {isDeletable(meeting.status) && (
        <Button
          size="sm"
          variant="ghost"
          className="h-7 gap-1 px-2 text-xs text-destructive hover:bg-destructive/10 hover:text-destructive"
          onClick={() => onDelete(meeting)}
        >
          <Trash2 className="size-3" />
          삭제
        </Button>
      )}
    </div>
  )
}

/* ─── Skeleton ───────────────────────────────────── */

function MeetingTableSkeleton() {
  return (
    <div className="overflow-x-auto rounded-lg border border-border bg-card">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead className="w-[120px]">날짜</TableHead>
            <TableHead className="w-[140px]">프로젝트</TableHead>
            <TableHead className="w-[120px]">파트</TableHead>
            <TableHead>제목</TableHead>
            <TableHead className="w-[100px]">주최자</TableHead>
            <TableHead className="w-[100px]">상태</TableHead>
            <TableHead className="w-[140px] text-right">액션</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {Array.from({ length: 5 }).map((_, i) => (
            <TableRow key={i}>
              <TableCell><Skeleton className="h-4 w-16" /></TableCell>
              <TableCell><Skeleton className="h-4 w-20" /></TableCell>
              <TableCell><Skeleton className="h-4 w-16" /></TableCell>
              <TableCell><Skeleton className="h-4 w-40" /></TableCell>
              <TableCell><Skeleton className="h-4 w-14" /></TableCell>
              <TableCell><Skeleton className="h-5 w-16 rounded-full" /></TableCell>
              <TableCell className="text-right"><Skeleton className="ml-auto h-7 w-24" /></TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
