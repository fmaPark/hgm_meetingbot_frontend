/**
 * Admin page UI types and helpers
 * Maps from API User type for display
 */
import { formatDistanceToNowStrict, parseISO } from "date-fns"
import { ko } from "date-fns/locale"
import type { User } from "@/lib/api/types"

/** Sort fields for user table */
export type UserSortField = "name" | "email" | "lastLogin"

/** Sort direction */
export type SortDirection = "asc" | "desc"

export interface UserSortConfig {
  field: UserSortField
  direction: SortDirection
}

/** Admin user view model (mapped from API User) */
export interface AdminUser {
  id: number
  avatar: string | null
  name: string
  email: string
  roles: string[]
  authorizedPartIds: number[]
  isActive: boolean
  lastLogin: string
}

/* ─── Role Badge Config ──────────────────────────── */

export const ROLE_BADGE_STYLES: Record<string, { bg: string; text: string; label: string }> = {
  admin: { bg: "bg-red-100", text: "text-red-800", label: "admin" },
  user: { bg: "bg-blue-100", text: "text-blue-800", label: "user" },
  po: { bg: "bg-purple-100", text: "text-purple-800", label: "po" },
}

const DEFAULT_ROLE_BADGE = { bg: "bg-gray-100", text: "text-gray-700", label: "" }

export function getRoleBadgeStyle(role: string) {
  return ROLE_BADGE_STYLES[role] ?? { ...DEFAULT_ROLE_BADGE, label: role }
}

export const STATUS_BADGE_STYLES = {
  active: { bg: "bg-green-100", text: "text-green-800", label: "활성" },
  inactive: { bg: "bg-gray-100", text: "text-gray-500", label: "비활성" },
} as const

/** Convert API User to AdminUser view model */
export function apiUserToAdminUser(user: User): AdminUser {
  return {
    id: user.id,
    avatar: user.avatar_url ?? null,
    name: user.username,
    email: user.email,
    roles: user.roles,
    authorizedPartIds: user.authorized_part_ids,
    isActive: user.is_active,
    lastLogin: user.last_login_at
      ? formatDistanceToNowStrict(parseISO(user.last_login_at), { locale: ko, addSuffix: true })
      : "없음",
  }
}

/** Get initials from name for avatar fallback */
export function getInitials(name: string): string {
  return name.slice(0, 1)
}

/** Format part access count for display */
export function formatPartAccessLabel(partIds: number[], isAdmin: boolean): string {
  if (isAdmin) return "전체 접근"
  if (partIds.length === 0) return "접근 없음"
  return `${partIds.length}개 파트`
}
