/** Permission definition */
export interface Permission {
  id: number
  name: string
  label: string
}

/** Role definition */
export interface Role {
  id: number
  name: string
  description: string
  permissions: string[]
  /** Whether any users are assigned to this role (for delete guard) */
  userCount: number
}

/** Edit form state for a role */
export interface RoleFormState {
  name: string
  description: string
  permissions: string[]
}

/* ─── All Permissions (flat list) ────────────────── */

export const ALL_PERMISSIONS: Permission[] = [
  { id: 1, name: "meeting:summarize", label: "회의 요약" },
  { id: 2, name: "meeting:transcribe", label: "회의 전사" },
  { id: 3, name: "meeting:edit_summary", label: "요약 수정" },
  { id: 4, name: "meeting:upload", label: "회의 업로드" },
  { id: 5, name: "meeting:delete", label: "회의 삭제" },
  { id: 6, name: "meeting:restore", label: "회의 복구" },
  { id: 7, name: "meeting:read_deleted", label: "삭제된 회의 조회" },
  { id: 8, name: "project:create", label: "프로젝트 생성" },
  { id: 9, name: "part:create", label: "파트 생성" },
  { id: 10, name: "part:update", label: "파트 수정" },
  { id: 11, name: "prompt:manage", label: "프롬프트 관리" },
  { id: 12, name: "keyword:manage", label: "키워드 관리" },
  { id: 13, name: "asana:manage", label: "Asana 관리" },
  { id: 14, name: "user:read", label: "사용자 조회" },
  { id: 15, name: "user:update_permissions", label: "사용자 권한 수정" },
  { id: 16, name: "user:manage_approval", label: "사용자 승인 관리" },
  { id: 17, name: "rbac:manage", label: "역할/권한 관리" },
  { id: 18, name: "settings:manage_llm", label: "LLM 설정 관리" },
]

export const ALL_PERMISSION_NAMES = ALL_PERMISSIONS.map((p) => p.name)

/* ─── Sample Roles ─────────────────────────────── */

export const SAMPLE_ROLES: Role[] = [
  {
    id: 1,
    name: "admin",
    description: "시스템 전체 관리 권한",
    permissions: ALL_PERMISSION_NAMES,
    userCount: 1,
  },
  {
    id: 2,
    name: "user",
    description: "일반 사용자",
    permissions: ["meeting:summarize", "meeting:transcribe"],
    userCount: 3,
  },
  {
    id: 3,
    name: "po",
    description: "프로젝트 오너 권한",
    permissions: [
      "meeting:summarize",
      "meeting:transcribe",
      "project:create",
      "part:create",
    ],
    userCount: 1,
  },
]

/** Validate role name: 한글/영문/숫자/언더스코어 only */
export function isValidRoleName(name: string): boolean {
  return /^[가-힣a-zA-Z0-9_]+$/.test(name) && name.trim().length > 0
}

/** Create an empty form state for a new role */
export function createEmptyFormState(): RoleFormState {
  return { name: "", description: "", permissions: [] }
}

/** Create a form state from an existing role */
export function roleToFormState(role: Role): RoleFormState {
  return {
    name: role.name,
    description: role.description,
    permissions: [...role.permissions],
  }
}

/** Check if form state has changes compared to a role */
export function hasFormChanges(form: RoleFormState, role: Role | null): boolean {
  if (!role) {
    // New role mode: has changes if name is non-empty
    return form.name.trim() !== "" || form.description.trim() !== "" || form.permissions.length > 0
  }
  if (form.name !== role.name) return true
  if (form.description !== role.description) return true
  if (form.permissions.length !== role.permissions.length) return true
  const sorted1 = [...form.permissions].sort()
  const sorted2 = [...role.permissions].sort()
  return sorted1.some((p, i) => p !== sorted2[i])
}
