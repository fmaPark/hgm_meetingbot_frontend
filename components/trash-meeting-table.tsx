"use client"

import { ChevronUp, ChevronDown, Eye, RotateCcw } from "lucide-react"
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
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip"
import { StatusBadge } from "@/components/status-badge"
import type { DeletedMeeting, TrashSortConfig, TrashSortField } from "@/lib/meeting-types"
import {
  formatRelativeDate,
  formatDeletedRelative,
  formatDaysUntilPermanent,
  isViewable,
  isClickable,
} from "@/lib/meeting-types"

type DisplayDeletedMeeting = DeletedMeeting & { _fading?: boolean }

interface TrashMeetingTableProps {
  meetings: DisplayDeletedMeeting[]
  sort: TrashSortConfig
  onSortChange: (field: TrashSortField) => void
  onRestore: (meeting: DeletedMeeting) => void
  onView: (meeting: DeletedMeeting) => void
  loading?: boolean
}

const SORTABLE_COLUMNS: { field: TrashSortField; label: string; width: string }[] = [
  { field: "date", label: "날짜", width: "w-[120px]" },
  { field: "project", label: "프로젝트", width: "w-[120px]" },
  { field: "part", label: "파트", width: "w-[100px]" },
]

export function TrashMeetingTable({
  meetings,
  sort,
  onSortChange,
  onRestore,
  onView,
  loading = false,
}: TrashMeetingTableProps) {
  if (loading) {
    return <TrashTableSkeleton />
  }

  return (
    <div className="w-full overflow-x-auto rounded-lg border border-red-200 bg-card">
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
            <TableHead
              className="w-[120px] cursor-pointer select-none hover:bg-gray-50"
              onClick={() => onSortChange("deletedAt")}
            >
              <span className="inline-flex items-center gap-1">
                삭제일
                <SortIndicator field="deletedAt" sort={sort} />
              </span>
            </TableHead>
            <TableHead className="w-[120px] text-right">액션</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {meetings.map((meeting) => (
            <TableRow
              key={meeting.id}
              className={cn(
                isClickable(meeting.status) && "cursor-pointer hover:bg-gray-50",
                meeting._fading && "animate-fade-out-row"
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
              <TableCell>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="cursor-default text-sm text-text-secondary">
                      {formatDeletedRelative(meeting.deletedAt)}
                    </span>
                  </TooltipTrigger>
                  <TooltipContent>
                    {formatDaysUntilPermanent(meeting.daysUntilPermanent)}
                  </TooltipContent>
                </Tooltip>
              </TableCell>
              <TableCell className="text-right">
                <TrashActions
                  meeting={meeting}
                  onRestore={onRestore}
                  onView={onView}
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

function SortIndicator({ field, sort }: { field: TrashSortField; sort: TrashSortConfig }) {
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

interface TrashActionsProps {
  meeting: DeletedMeeting
  onRestore: (meeting: DeletedMeeting) => void
  onView: (meeting: DeletedMeeting) => void
}

function TrashActions({ meeting, onRestore, onView }: TrashActionsProps) {
  return (
    <div
      className="flex items-center justify-end gap-1"
      onClick={(e) => e.stopPropagation()}
    >
      <Button
        size="sm"
        variant="default"
        className="h-7 gap-1 px-2 text-xs"
        onClick={() => onRestore(meeting)}
      >
        <RotateCcw className="size-3" />
        복구
      </Button>
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
    </div>
  )
}

/* ─── Skeleton ───────────────────────────────────── */

function TrashTableSkeleton() {
  return (
    <div className="overflow-x-auto rounded-lg border border-red-200 bg-card">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead className="w-[120px]">날짜</TableHead>
            <TableHead className="w-[120px]">프로젝트</TableHead>
            <TableHead className="w-[100px]">파트</TableHead>
            <TableHead>제목</TableHead>
            <TableHead className="w-[100px]">주최자</TableHead>
            <TableHead className="w-[100px]">상태</TableHead>
            <TableHead className="w-[120px]">삭제일</TableHead>
            <TableHead className="w-[120px] text-right">액션</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {Array.from({ length: 3 }).map((_, i) => (
            <TableRow key={i}>
              <TableCell><Skeleton className="h-4 w-16" /></TableCell>
              <TableCell><Skeleton className="h-4 w-20" /></TableCell>
              <TableCell><Skeleton className="h-4 w-16" /></TableCell>
              <TableCell><Skeleton className="h-4 w-40" /></TableCell>
              <TableCell><Skeleton className="h-4 w-14" /></TableCell>
              <TableCell><Skeleton className="h-5 w-16 rounded-full" /></TableCell>
              <TableCell><Skeleton className="h-4 w-14" /></TableCell>
              <TableCell className="text-right"><Skeleton className="ml-auto h-7 w-20" /></TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
