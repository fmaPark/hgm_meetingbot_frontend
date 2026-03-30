/**
 * 회의 관련 UI 타입 정의
 * API 타입(lib/api/types.ts)을 re-export하고 UI 전용 헬퍼를 제공
 */
import { format, formatDistanceToNowStrict, differenceInDays, parseISO } from "date-fns"
import { ko } from "date-fns/locale"
import type { Meeting as ApiMeeting, MeetingStatus } from "@/lib/api/types"

// API Meeting 타입을 그대로 사용
export type Meeting = ApiMeeting
export type { MeetingStatus }

export interface MeetingFilters {
  project: string // "all" | project name
  part: string // "all" | part name
  search: string
}

export type SortField = "start_time" | "project" | "part" | "status"
export type SortDirection = "asc" | "desc"

export interface SortConfig {
  field: SortField
  direction: SortDirection
}

export interface DeletedMeeting extends Meeting {
  // deleted_at은 이미 Meeting에 포함 (string | null)
}

export type TrashSortField = "start_time" | "project" | "part" | "status" | "deleted_at"

export interface TrashSortConfig {
  field: TrashSortField
  direction: SortDirection
}

// ─── Display Helpers ─────────────────────────────────────

/** ISO datetime → "2026-02-19" 형식 */
export function formatDate(isoStr: string): string {
  return format(parseISO(isoStr), "yyyy-MM-dd")
}

/** ISO datetime → "오늘", "어제", "3일 전", 또는 "2026-02-19" */
export function formatRelativeDate(isoStr: string): string {
  const date = parseISO(isoStr)
  const now = new Date()
  const diffDays = differenceInDays(now, date)

  if (diffDays === 0) return "오늘"
  if (diffDays === 1) return "어제"
  if (diffDays >= 2 && diffDays <= 7) return `${diffDays}일 전`
  return format(date, "yyyy-MM-dd")
}

/** deleted_at → "3일 전" */
export function formatDeletedRelative(isoStr: string): string {
  return formatDistanceToNowStrict(parseISO(isoStr), { locale: ko, addSuffix: true })
}

/** 영구 삭제까지 남은 일수 계산 (30일 기준) */
export function getDaysUntilPermanent(deletedAt: string): number {
  const deletedDate = parseISO(deletedAt)
  const now = new Date()
  const elapsed = differenceInDays(now, deletedDate)
  return Math.max(0, 30 - elapsed)
}

/** "N일 후 영구 삭제" */
export function formatDaysUntilPermanent(deletedAt: string): string {
  const days = getDaysUntilPermanent(deletedAt)
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

/** Check if any meetings have processing status */
export function hasProcessingItems(meetings: Meeting[]): boolean {
  return meetings.some((m) => m.status === "PROCESSING")
}
