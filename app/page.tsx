"use client"

import { useState, useCallback, useMemo } from "react"
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
import type {
  Meeting,
  MeetingFilters,
  SortConfig,
  SortField,
} from "@/lib/meeting-types"
import { hasProcessingItems } from "@/lib/meeting-types"
import { useMeetings, useDeleteMeeting } from "@/lib/hooks/use-meetings"
import { useProjects } from "@/lib/hooks/use-projects"
import type { MeetingQueryParams } from "@/lib/api/types"

const PAGE_SIZE = 20

export default function DashboardPage() {
  const router = useRouter()

  // Filters & sort
  const [filters, setFilters] = useState<MeetingFilters>({
    project: "all",
    part: "all",
    search: "",
  })
  const [sort, setSort] = useState<SortConfig>({
    field: "start_time",
    direction: "desc",
  })
  const [currentPage, setCurrentPage] = useState(1)

  // Build API query params from UI state
  const queryParams = useMemo<MeetingQueryParams>(() => {
    const params: MeetingQueryParams = {
      page: currentPage,
      limit: PAGE_SIZE,
      sort: sort.field,
      order: sort.direction,
    }
    if (filters.project !== "all") params.project = filters.project
    if (filters.part !== "all") params.part = filters.part
    if (filters.search.trim()) params.search = filters.search.trim()
    return params
  }, [filters, sort, currentPage])

  // Data queries
  const meetingsQuery = useMeetings(queryParams)
  const meetings = meetingsQuery.data?.items ?? []
  const totalPages = meetingsQuery.data?.total_pages ?? 1
  const meetingsLoading = meetingsQuery.isLoading

  // Enable polling when processing items exist
  useMeetings(
    queryParams,
    hasProcessingItems(meetings)
  )

  const { data: projects } = useProjects()

  // Derive project/part names for filter bar
  const projectNames = useMemo(
    () => projects?.map((p) => p.name) ?? [],
    [projects]
  )
  const partNames = useMemo(() => {
    if (!projects) return []
    const parts = new Set<string>()
    for (const project of projects) {
      for (const part of project.parts) {
        parts.add(part.name)
      }
    }
    return Array.from(parts)
  }, [projects])

  // Mutations
  const deleteMutation = useDeleteMeeting()

  // Modal states
  const [deleteTarget, setDeleteTarget] = useState<Meeting | null>(null)
  const [summarizeTarget, setSummarizeTarget] = useState<Meeting | null>(null)
  const [viewTarget, setViewTarget] = useState<Meeting | null>(null)

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

  const handleDeleteConfirm = useCallback(() => {
    if (!deleteTarget) return
    deleteMutation.mutate(deleteTarget.id, {
      onSuccess: () => {
        setDeleteTarget(null)
      },
    })
  }, [deleteTarget, deleteMutation])

  const handleResetFilters = useCallback(() => {
    setFilters({ project: "all", part: "all", search: "" })
    setCurrentPage(1)
  }, [])

  // ── Determine empty state ──
  const hasFiltersApplied =
    filters.project !== "all" ||
    filters.part !== "all" ||
    filters.search.trim() !== ""
  const isNoData = !meetingsLoading && meetings.length === 0 && !hasFiltersApplied
  const isFilteredEmpty =
    !meetingsLoading && meetings.length === 0 && hasFiltersApplied

  return (
    <AppLayout>
      <MeetingFilterBar
        filters={filters}
        onFiltersChange={handleFiltersChange}
        projects={projectNames}
        parts={partNames}
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
                meetings={meetings}
                sort={sort}
                onSortChange={handleSortChange}
                onView={handleView}
                onSummarize={handleSummarize}
                onRetry={handleRetry}
                onDelete={setDeleteTarget}
                loading={meetingsLoading}
              />
            </div>

            {/* Mobile: Card list view */}
            <div className="md:hidden">
              <MeetingCardList
                meetings={meetings}
                onView={handleView}
                onSummarize={handleSummarize}
                onRetry={handleRetry}
                onDelete={setDeleteTarget}
                loading={meetingsLoading}
              />
            </div>

            {!meetingsLoading && (
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
      />

      {/* Meeting Summary Viewer/Editor Modal */}
      <MeetingSummaryModal
        open={viewTarget !== null}
        onOpenChange={(open) => {
          if (!open) setViewTarget(null)
        }}
        meeting={viewTarget}
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
        loading={deleteMutation.isPending}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
      />
    </AppLayout>
  )
}
