/** User role type */
export type UserRole = "admin" | "user" | "po"

/** User status */
export type UserStatus = "active" | "inactive"

/** Sort fields for user table */
export type UserSortField = "name" | "email" | "lastLogin"

/** Sort direction */
export type SortDirection = "asc" | "desc"

export interface UserSortConfig {
  field: UserSortField
  direction: SortDirection
}

/** Part access: "all" = full access, string[] = specific parts, [] = no access */
export type PartAccess = "all" | string[]

/** Admin user */
export interface AdminUser {
  id: number
  avatar: string | null
  name: string
  email: string
  roles: UserRole[]
  partAccess: PartAccess
  status: UserStatus
  lastLogin: string
}

/** Project tree item for permission modal */
export interface ProjectTreeItem {
  id: number
  name: string
  parts: PartTreeItem[]
}

export interface PartTreeItem {
  id: number
  name: string
}

/** Available role for assignment */
export interface AvailableRole {
  id: number
  name: UserRole
  label: string
  description: string
}

/* ─── Role Badge Config ──────────────────────────── */

export const ROLE_BADGE_STYLES: Record<UserRole | "other", { bg: string; text: string; label: string }> = {
  admin: { bg: "bg-red-100", text: "text-red-800", label: "admin" },
  user: { bg: "bg-blue-100", text: "text-blue-800", label: "user" },
  po: { bg: "bg-purple-100", text: "text-purple-800", label: "po" },
  other: { bg: "bg-gray-100", text: "text-gray-700", label: "other" },
}

export const STATUS_BADGE_STYLES: Record<UserStatus, { bg: string; text: string; label: string }> = {
  active: { bg: "bg-green-100", text: "text-green-800", label: "활성" },
  inactive: { bg: "bg-gray-100", text: "text-gray-500", label: "비활성" },
}

/* ─── Sample Data ──────────────────────────────── */

export const SAMPLE_USERS: AdminUser[] = [
  {
    id: 1,
    avatar: null,
    name: "김철수",
    email: "kim@hgm.com",
    roles: ["admin"],
    partAccess: "all",
    status: "active",
    lastLogin: "2시간 전",
  },
  {
    id: 2,
    avatar: null,
    name: "이영희",
    email: "lee@hgm.com",
    roles: ["user", "po"],
    partAccess: ["기획파트", "개발파트", "디자인파트", "마케팅파트", "영업파트"],
    status: "active",
    lastLogin: "1일 전",
  },
  {
    id: 3,
    avatar: null,
    name: "박민수",
    email: "park@hgm.com",
    roles: ["user"],
    partAccess: ["기획파트", "개발파트", "디자인파트"],
    status: "active",
    lastLogin: "3일 전",
  },
  {
    id: 4,
    avatar: null,
    name: "최지은",
    email: "choi@hgm.com",
    roles: ["user"],
    partAccess: [],
    status: "inactive",
    lastLogin: "30일 전",
  },
]

export const SAMPLE_PROJECT_TREE: ProjectTreeItem[] = [
  {
    id: 1,
    name: "프로젝트 A",
    parts: [
      { id: 1, name: "기획파트" },
      { id: 2, name: "개발파트" },
      { id: 3, name: "디자인파트" },
    ],
  },
  {
    id: 2,
    name: "프로젝트 B",
    parts: [
      { id: 4, name: "마케팅파트" },
      { id: 5, name: "영업파트" },
    ],
  },
]

export const AVAILABLE_ROLES: AvailableRole[] = [
  { id: 1, name: "admin", label: "관리자 (admin)", description: "모든 기능에 접근할 수 있습니다." },
  { id: 2, name: "user", label: "사용자 (user)", description: "회의록 관리 기능에 접근할 수 있습니다." },
  { id: 3, name: "po", label: "PO (po)", description: "프로젝트 오너 권한으로 접근합니다." },
]

/** Get all part names from tree */
export function getAllPartNames(tree: ProjectTreeItem[]): string[] {
  return tree.flatMap((p) => p.parts.map((part) => part.name))
}

/** Get initials from name for avatar fallback */
export function getInitials(name: string): string {
  return name.slice(0, 1)
}

/** Format part access for display */
export function formatPartAccess(access: PartAccess): {
  label: string
  type: "all" | "partial" | "none"
  parts?: string[]
} {
  if (access === "all") {
    return { label: "전체 접근", type: "all" }
  }
  if (access.length === 0) {
    return { label: "접근 없음", type: "none" }
  }
  return {
    label: `${access.length}개 파트`,
    type: "partial",
    parts: access,
  }
}
