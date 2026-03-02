"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import { useRouter } from "next/navigation"
import { AppLayout } from "@/components/app-layout"
import { MeetingFilterBar } from "@/components/meeting-filter-bar"
import { MeetingTable } from "@/components/meeting-table"
import { MeetingCardList } from "@/components/meeting-card-list"
import { MeetingPagination } from "@/components/meeting-pagination"
import { EmptyMeetings, EmptyFilteredResults } from "@/components/empty-state"
import { ConfirmDialog } from "@/components/confirm-dialog"
import { SummarizeSettingsModal } from "@/components/summarize/summarize-settings-modal"
import { MeetingSummaryModal } from "@/components/summary/meeting-summary-modal"
import type { MeetingStatus } from "@/components/status-badge"
import type {
  Meeting,
  MeetingFilters,
  SortConfig,
  SortField,
} from "@/lib/meeting-types"
import { SAMPLE_MEETINGS, hasProcessingItems } from "@/lib/meeting-types"

const PAGE_SIZE = 10

export default function DashboardPage() {
  const router = useRouter()

  // Data
  const [meetings, setMeetings] = useState<Meeting[]>([])
  const [loading, setLoading] = useState(true)

  // Filters & sort
  const [filters, setFilters] = useState<MeetingFilters>({
    project: "all",
    part: "all",
    search: "",
  })
  const [sort, setSort] = useState<SortConfig>({
    field: "date",
    direction: "desc",
  })
  const [currentPage, setCurrentPage] = useState(1)

  // Delete dialog
  const [deleteTarget, setDeleteTarget] = useState<Meeting | null>(null)
  const [deleteLoading, setDeleteLoading] = useState(false)

  // Summarize modal
  const [summarizeTarget, setSummarizeTarget] = useState<Meeting | null>(null)

  // Summary viewer/editor modal
  const [viewTarget, setViewTarget] = useState<Meeting | null>(null)

  // ── Initial data load (simulated) ──
  useEffect(() => {
    const timer = setTimeout(() => {
      setMeetings(SAMPLE_MEETINGS)
      setLoading(false)
    }, 800)
    return () => clearTimeout(timer)
  }, [])

  // ── Polling for PROCESSING items ──
  useEffect(() => {
    if (!hasProcessingItems(meetings)) return
    const interval = setInterval(() => {
      // In a real app this would re-fetch from the API
      setMeetings((prev) => [...prev])
    }, 5000)
    return () => clearInterval(interval)
  }, [meetings])

  // ── Filter Logic ──
  const filteredMeetings = useMemo(() => {
    let result = [...meetings]

    // Project filter
    if (filters.project !== "all") {
      result = result.filter((m) => m.project === filters.project)
    }
    // Part filter
    if (filters.part !== "all") {
      result = result.filter((m) => m.part === filters.part)
    }
    // Search filter
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
    (field: SortField) => {
      setSort((prev) => ({
        field,
        direction:
          prev.field === field && prev.direction === "desc" ? "asc" : "desc",
      }))
    },
    []
  )

  const handleView = useCallback((meeting: Meeting) => {
    setViewTarget(meeting)
  }, [])

  const handleSummarize = useCallback((meeting: Meeting) => {
    setSummarizeTarget(meeting)
  }, [])

  const handleRetry = useCallback((meeting: Meeting) => {
    setSummarizeTarget(meeting)
  }, [])

  // Handle status change from the summarize modal
  const handleMeetingStatusChange = useCallback(
    (meetingId: number, newStatus: MeetingStatus) => {
      setMeetings((prev) =>
        prev.map((m) => (m.id === meetingId ? { ...m, status: newStatus } : m))
      )
    },
    []
  )

  const handleDeleteFromModal = useCallback((meetingId: number) => {
    setMeetings((prev) => prev.filter((m) => m.id !== meetingId))
  }, [])

  const handleDeleteConfirm = useCallback(() => {
    if (!deleteTarget) return
    setDeleteLoading(true)
    // Simulate async delete
    setTimeout(() => {
      setMeetings((prev) => prev.filter((m) => m.id !== deleteTarget.id))
      setDeleteLoading(false)
      setDeleteTarget(null)
    }, 1000)
  }, [deleteTarget])

  const handleResetFilters = useCallback(() => {
    setFilters({ project: "all", part: "all", search: "" })
    setCurrentPage(1)
  }, [])

  // ── Determine empty state ──
  const hasFiltersApplied =
    filters.project !== "all" ||
    filters.part !== "all" ||
    filters.search.trim() !== ""
  const isNoData = !loading && meetings.length === 0
  const isFilteredEmpty =
    !loading && meetings.length > 0 && sortedMeetings.length === 0

  return (
    <AppLayout>
      <MeetingFilterBar
        filters={filters}
        onFiltersChange={handleFiltersChange}
        hasDeletePermission
        onTrashClick={() => router.push("/dashboard/trash")}
      />

      {/* Main Content */}
      <main className="w-full p-4">
        {isNoData ? (
          <EmptyMeetings />
        ) : isFilteredEmpty ? (
          <EmptyFilteredResults onReset={handleResetFilters} />
        ) : (
          <>
            {/* Desktop: Table view */}
            <div className="hidden w-full md:block">
              <MeetingTable
                meetings={paginatedMeetings}
                sort={sort}
                onSortChange={handleSortChange}
                onView={handleView}
                onSummarize={handleSummarize}
                onRetry={handleRetry}
                onDelete={setDeleteTarget}
                loading={loading}
              />
            </div>

            {/* Mobile: Card list view */}
            <div className="md:hidden">
              <MeetingCardList
                meetings={paginatedMeetings}
                onView={handleView}
                onSummarize={handleSummarize}
                onRetry={handleRetry}
                onDelete={setDeleteTarget}
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

      {/* Summarize Settings Modal */}
      <SummarizeSettingsModal
        open={summarizeTarget !== null}
        onOpenChange={(open) => {
          if (!open) setSummarizeTarget(null)
        }}
        meeting={summarizeTarget}
        onStatusChange={handleMeetingStatusChange}
      />

      {/* Meeting Summary Viewer/Editor Modal */}
      <MeetingSummaryModal
        open={viewTarget !== null}
        onOpenChange={(open) => {
          if (!open) setViewTarget(null)
        }}
        meeting={viewTarget}
        onDelete={handleDeleteFromModal}
        onStatusChange={handleMeetingStatusChange}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null)
        }}
        title="회의 삭제"
        description="휴지통으로 이동하시겠습니까? 30일 후 자동 삭제됩니다."
        confirmText="삭제"
        cancelText="취소"
        variant="destructive"
        loading={deleteLoading}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
      />
    </AppLayout>
  )
}
