"use client"

import { useState, useCallback, useMemo } from "react"
import { useRouter } from "next/navigation"
import { AlertTriangle, ArrowLeft } from "lucide-react"
import { AppLayout } from "@/components/app-layout"
import { MeetingFilterBar } from "@/components/meeting-filter-bar"
import { TrashMeetingTable } from "@/components/trash-meeting-table"
import { TrashCardList } from "@/components/trash-card-list"
import { MeetingPagination } from "@/components/meeting-pagination"
import { EmptyTrash } from "@/components/empty-state"
import { EmptyState } from "@/components/empty-state"
import { ConfirmDialog } from "@/components/confirm-dialog"
import { MeetingSummaryModal } from "@/components/summary/meeting-summary-modal"
import { Button } from "@/components/ui/button"
import { Trash2 } from "lucide-react"
import type {
  DeletedMeeting,
  MeetingFilters,
  TrashSortConfig,
  TrashSortField,
} from "@/lib/meeting-types"
import { SAMPLE_DELETED_MEETINGS } from "@/lib/meeting-types"

const PAGE_SIZE = 10

export default function TrashPage() {
  const router = useRouter()

  // Data
  const [meetings, setMeetings] = useState<DeletedMeeting[]>(SAMPLE_DELETED_MEETINGS)
  const [loading, setLoading] = useState(false)
  const [fadingId, setFadingId] = useState<number | null>(null)

  // Filters & sort
  const [filters, setFilters] = useState<MeetingFilters>({
    project: "all",
    part: "all",
    search: "",
  })
  const [sort, setSort] = useState<TrashSortConfig>({
    field: "deletedAt",
    direction: "desc",
  })
  const [currentPage, setCurrentPage] = useState(1)

  // Summary viewer modal (read-only)
  const [viewTarget, setViewTarget] = useState<DeletedMeeting | null>(null)

  // Restore dialog
  const [restoreTarget, setRestoreTarget] = useState<DeletedMeeting | null>(null)
  const [restoreLoading, setRestoreLoading] = useState(false)

  // ── Filter Logic ──
  const filteredMeetings = useMemo(() => {
    let result = [...meetings]

    if (filters.project !== "all") {
      result = result.filter((m) => m.project === filters.project)
    }
    if (filters.part !== "all") {
      result = result.filter((m) => m.part === filters.part)
    }
    if (filters.search.trim()) {
      const q = filters.search.toLowerCase()
      result = result.filter(
        (m) =>
          m.title.toLowerCase().includes(q) ||
          m.host.toLowerCase().includes(q)
      )
    }

    return result
  }, [meetings, filters])

  // ── Sort Logic ──
  const sortedMeetings = useMemo(() => {
    const result = [...filteredMeetings]
    const { field, direction } = sort
    const dir = direction === "asc" ? 1 : -1

    result.sort((a, b) => {
      const aVal = a[field]
      const bVal = b[field]
      if (aVal < bVal) return -1 * dir
      if (aVal > bVal) return 1 * dir
      return 0
    })

    return result
  }, [filteredMeetings, sort])

  // ── Pagination Logic ──
  const totalPages = Math.max(1, Math.ceil(sortedMeetings.length / PAGE_SIZE))
  const paginatedMeetings = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE
    return sortedMeetings.slice(start, start + PAGE_SIZE)
  }, [sortedMeetings, currentPage])

  // ── Handlers ──
  const handleFiltersChange = useCallback((newFilters: MeetingFilters) => {
    setFilters(newFilters)
    setCurrentPage(1)
  }, [])

  const handleSortChange = useCallback(
    (field: TrashSortField) => {
      setSort((prev) => ({
        field,
        direction:
          prev.field === field && prev.direction === "desc" ? "asc" : "desc",
      }))
    },
    []
  )

  const handleView = useCallback((meeting: DeletedMeeting) => {
    setViewTarget(meeting)
  }, [])

  const handleRestoreFromModal = useCallback(
    (meetingId: number) => {
      // Remove from trash list and close modal
      setFadingId(meetingId)
      setTimeout(() => {
        setMeetings((prev) => prev.filter((m) => m.id !== meetingId))
        setFadingId(null)
      }, 400)
    },
    []
  )

  const handleRestoreConfirm = useCallback(() => {
    if (!restoreTarget) return
    setRestoreLoading(true)

    // Simulate async restore
    setTimeout(() => {
      setRestoreLoading(false)
      setRestoreTarget(null)

      // Fade out animation
      const targetId = restoreTarget.id
      setFadingId(targetId)

      setTimeout(() => {
        setMeetings((prev) => prev.filter((m) => m.id !== targetId))
        setFadingId(null)
      }, 400)
    }, 1000)
  }, [restoreTarget])

  const handleResetFilters = useCallback(() => {
    setFilters({ project: "all", part: "all", search: "" })
    setCurrentPage(1)
  }, [])

  // ── Determine empty state ──
  const isNoData = !loading && meetings.length === 0
  const isFilteredEmpty =
    !loading && meetings.length > 0 && sortedMeetings.length === 0

  // Apply fade-out to paginated meetings
  const displayMeetings = paginatedMeetings.map((m) => ({
    ...m,
    _fading: m.id === fadingId,
  }))

  return (
    <AppLayout>
      {/* Warning Banner */}
      <div className="sticky top-0 z-50 border-b border-red-200 bg-red-50">
        {/* Desktop */}
        <div className="hidden h-[65px] items-center justify-between px-4 md:flex">
          <div className="flex items-center gap-2">
            <AlertTriangle className="size-4 shrink-0 text-red-600" />
            <span className="text-sm font-medium text-red-800">
              휴지통 - 휴지통에 있는 항목은 30일 후 완전삭제됩니다.
            </span>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push("/")}
            className="shrink-0 gap-1.5"
          >
            <ArrowLeft className="size-4" />
            목록으로 돌아가기
          </Button>
        </div>
        {/* Mobile */}
        <div className="flex flex-col gap-3 px-4 py-3 md:hidden">
          <div className="flex items-start gap-2">
            <AlertTriangle className="mt-0.5 size-4 shrink-0 text-red-600" />
            <span className="text-sm font-medium text-red-800">
              휴지통 - 휴지통에 있는 항목은 30일 후 완전삭제됩니다.
            </span>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push("/")}
            className="w-full gap-1.5"
          >
            <ArrowLeft className="size-4" />
            목록으로 돌아가기
          </Button>
        </div>
      </div>

      {/* Filter Bar (without trash button) */}
      <MeetingFilterBar
        filters={filters}
        onFiltersChange={handleFiltersChange}
        hasDeletePermission={false}
      />

      {/* Main Content */}
      <main className="w-full p-4">
        {isNoData ? (
          <EmptyTrash />
        ) : isFilteredEmpty ? (
          <EmptyState
            icon={<Trash2 className="size-12" />}
            title="조건에 맞는 삭제된 회의가 없습니다"
            action={{
              label: "필터 초기화",
              onClick: handleResetFilters,
              variant: "outline",
            }}
          />
        ) : (
          <>
            {/* Desktop: Table view */}
            <div className="hidden w-full md:block">
              <TrashMeetingTable
                meetings={displayMeetings}
                sort={sort}
                onSortChange={handleSortChange}
                onRestore={setRestoreTarget}
                onView={handleView}
                loading={loading}
              />
            </div>

            {/* Mobile: Card list view */}
            <div className="md:hidden">
              <TrashCardList
                meetings={displayMeetings}
                onRestore={setRestoreTarget}
                onView={handleView}
                loading={loading}
              />
            </div>

            {!loading && (
              <MeetingPagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
            )}
          </>
        )}
      </main>

      {/* Summary Viewer Modal (read-only) */}
      <MeetingSummaryModal
        open={viewTarget !== null}
        onOpenChange={(open) => {
          if (!open) setViewTarget(null)
        }}
        meeting={viewTarget}
        readOnly
        onRestore={handleRestoreFromModal}
      />

      {/* Restore Confirmation Dialog */}
      <ConfirmDialog
        open={restoreTarget !== null}
        onOpenChange={(open) => {
          if (!open) setRestoreTarget(null)
        }}
        title="회의 복구"
        description="선택한 회의를 복구하시겠습니까?"
        confirmText="복구"
        cancelText="취소"
        variant="default"
        loading={restoreLoading}
        onConfirm={handleRestoreConfirm}
        onCancel={() => setRestoreTarget(null)}
      />
    </AppLayout>
  )
}
