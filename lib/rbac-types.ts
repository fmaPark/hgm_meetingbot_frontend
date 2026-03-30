/**
 * RBAC types – re-exports API types and provides UI helpers
 */
import type { RoleWithPermissions } from "@/lib/api/types"

/** Permission definition with UI label */
export interface PermissionDef {
  name: string
  label: string
}

/** Edit form state for a role */
export interface RoleFormState {
  name: string
  permissions: string[]
}

/* ─── All Permissions (static label mapping) ────────────────── */

export const ALL_PERMISSIONS: PermissionDef[] = [
  { name: "meeting:summarize", label: "회의 요약" },
  { name: "meeting:transcribe", label: "회의 전사" },
  { name: "meeting:edit_summary", label: "요약 수정" },
  { name: "meeting:upload", label: "회의 업로드" },
  { name: "meeting:delete", label: "회의 삭제" },
  { name: "meeting:restore", label: "회의 복구" },
  { name: "meeting:read_deleted", label: "삭제된 회의 조회" },
  { name: "project:create", label: "프로젝트 생성" },
  { name: "part:create", label: "파트 생성" },
  { name: "part:update", label: "파트 수정" },
  { name: "prompt:manage", label: "프롬프트 관리" },
  { name: "keyword:manage", label: "키워드 관리" },
  { name: "asana:manage", label: "Asana 관리" },
  { name: "user:read", label: "사용자 조회" },
  { name: "user:update_permissions", label: "사용자 권한 수정" },
  { name: "user:manage_approval", label: "사용자 승인 관리" },
  { name: "rbac:manage", label: "역할/권한 관리" },
  { name: "settings:manage_llm", label: "LLM 설정 관리" },
]

export const ALL_PERMISSION_NAMES = ALL_PERMISSIONS.map((p) => p.name)

/** Validate role name: 한글/영문/숫자/언더스코어 only */
export function isValidRoleName(name: string): boolean {
  return /^[가-힣a-zA-Z0-9_]+$/.test(name) && name.trim().length > 0
}

/** Create an empty form state for a new role */
export function createEmptyFormState(): RoleFormState {
  return { name: "", permissions: [] }
}

/** Create a form state from an existing role */
export function roleToFormState(role: RoleWithPermissions): RoleFormState {
  return {
    name: role.name,
    permissions: role.permissions.map((p) => p.name),
  }
}

/** Check if form state has changes compared to a role */
export function hasFormChanges(form: RoleFormState, role: RoleWithPermissions | null): boolean {
  if (!role) {
    return form.name.trim() !== "" || form.permissions.length > 0
  }
  if (form.name !== role.name) return true
  const rolePermNames = role.permissions.map((p) => p.name)
  if (form.permissions.length !== rolePermNames.length) return true
  const sorted1 = [...form.permissions].sort()
  const sorted2 = [...rolePermNames].sort()
  return sorted1.some((p, i) => p !== sorted2[i])
}
