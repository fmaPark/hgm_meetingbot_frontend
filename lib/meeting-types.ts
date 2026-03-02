import type { MeetingStatus } from "@/components/status-badge"

export interface Meeting {
  id: number
  date: string // YYYY-MM-DD
  project: string
  part: string
  title: string
  host: string
  status: MeetingStatus
}

export interface MeetingFilters {
  project: string // "all" | project name
  part: string // "all" | part name
  search: string
}

export type SortField = "date" | "project" | "part" | "status"
export type SortDirection = "asc" | "desc"

export interface SortConfig {
  field: SortField
  direction: SortDirection
}

export const SAMPLE_MEETINGS: Meeting[] = [
  {
    id: 1,
    date: "2026-02-19",
    project: "프로젝트A",
    part: "기획파트",
    title: "2월 정기 회의",
    host: "김철수",
    status: "SUMMARIZED",
  },
  {
    id: 2,
    date: "2026-02-18",
    project: "프로젝트A",
    part: "개발파트",
    title: "스프린트 리뷰",
    host: "이영희",
    status: "PROCESSING",
  },
  {
    id: 3,
    date: "2026-02-16",
    project: "프로젝트B",
    part: "디자인파트",
    title: "UI 검토 회의",
    host: "박민수",
    status: "STOPPED",
  },
  {
    id: 4,
    date: "2026-02-10",
    project: "프로젝트A",
    part: "기획파트",
    title: "킥오프 미팅",
    host: "최지은",
    status: "UPLOADED",
  },
  {
    id: 5,
    date: "2026-02-08",
    project: "프로젝트B",
    part: "개발파트",
    title: "버그 트리아지",
    host: "정현우",
    status: "FAILED",
  },
]

export interface DeletedMeeting extends Meeting {
  deletedAt: string // YYYY-MM-DD
  daysUntilPermanent: number
}

export type TrashSortField = "date" | "project" | "part" | "status" | "deletedAt"

export interface TrashSortConfig {
  field: TrashSortField
  direction: SortDirection
}

export const SAMPLE_DELETED_MEETINGS: DeletedMeeting[] = [
  {
    id: 101,
    date: "2026-02-10",
    project: "프로젝트A",
    part: "기획파트",
    title: "삭제된 회의 1",
    host: "김철수",
    status: "SUMMARIZED",
    deletedAt: "2026-02-16",
    daysUntilPermanent: 27,
  },
  {
    id: 102,
    date: "2026-02-08",
    project: "프로젝트B",
    part: "개발파트",
    title: "삭제된 회의 2",
    host: "이영희",
    status: "STOPPED",
    deletedAt: "2026-02-15",
    daysUntilPermanent: 26,
  },
  {
    id: 103,
    date: "2026-02-05",
    project: "프로젝트A",
    part: "디자인파트",
    title: "삭제된 회의 3",
    host: "박민수",
    status: "UPLOADED",
    deletedAt: "2026-02-12",
    daysUntilPermanent: 23,
  },
]

/** Format deleted-at date as relative (e.g. "3일 전") */
export function formatDeletedRelative(dateStr: string): string {
  const date = new Date(dateStr + "T00:00:00")
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const diffMs = today.getTime() - date.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffDays === 0) return "오늘"
  if (diffDays === 1) return "어제"
  return `${diffDays}일 전`
}

/** Format days until permanent deletion */
export function formatDaysUntilPermanent(days: number): string {
  return `${days}일 후 영구 삭제`
}

/** Check if a deleted meeting can be restored */
export function isRestorable(status: MeetingStatus): boolean {
  return (
    status === "STOPPED" ||
    status === "TRANSCRIBED" ||
    status === "SUMMARIZED" ||
    status === "UPLOADED" ||
    status === "FAILED"
  )
}

export const PROJECTS = ["프로젝트A", "프로젝트B"]
export const PARTS = ["기획파트", "개발파트", "디자인파트"]

/** Format a date string relative to today */
export function formatRelativeDate(dateStr: string): string {
  const date = new Date(dateStr + "T00:00:00")
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const diffMs = today.getTime() - date.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffDays === 0) return "오늘"
  if (diffDays === 1) return "어제"
  if (diffDays >= 2 && diffDays <= 7) return `${diffDays}일 전`
  return dateStr
}

/** Check if a meeting status allows "view detail" action */
export function isViewable(status: MeetingStatus): boolean {
  return status === "SUMMARIZED" || status === "UPLOADED"
}

/** Check if a meeting status allows "summarize" action */
export function isSummarizable(status: MeetingStatus): boolean {
  return status === "STOPPED" || status === "TRANSCRIBED"
}

/** Check if a meeting status allows "retry" action */
export function isRetryable(status: MeetingStatus): boolean {
  return status === "FAILED"
}

/** Check if a meeting status allows "delete" action */
export function isDeletable(status: MeetingStatus): boolean {
  return (
    status === "STOPPED" ||
    status === "TRANSCRIBED" ||
    status === "SUMMARIZED" ||
    status === "UPLOADED" ||
    status === "FAILED"
  )
}

/** Check if a meeting row should be clickable */
export function isClickable(status: MeetingStatus): boolean {
  return status === "SUMMARIZED" || status === "UPLOADED"
}

/** Check if a meeting status is still processing */
export function hasProcessingItems(meetings: Meeting[]): boolean {
  return meetings.some((m) => m.status === "PROCESSING")
}
