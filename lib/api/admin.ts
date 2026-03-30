import apiClient from './client'
import type {
  DiscordRoleMapping,
  DiscordRoleMappingCreate,
  LlmSettings,
  LlmSettingsUpdate,
  Permission,
  PermissionAssignmentRequest,
  PermissionCreate,
  Role,
  RoleAssignmentRequest,
  RoleCreate,
  RoleWithPermissions,
  User,
  UserPermissionsUpdate,
  UserUpdate,
} from './types'

export const adminApi = {
  // ─── User Management ────────────────────────────────

  /** 전체 사용자 목록 */
  getAllUsers() {
    return apiClient
      .get<User[]>('/admin/users')
      .then((r) => r.data)
  },

  /** 사용자 정보 수정 */
  updateUser(userId: number, data: UserUpdate) {
    return apiClient
      .put<User>(`/admin/users/${userId}`, data)
      .then((r) => r.data)
  },

  /** 사용자 삭제 */
  deleteUser(userId: number) {
    return apiClient.delete(`/admin/users/${userId}`)
  },

  /** 사용자 파트 접근 권한 설정 */
  updateUserPermissions(userId: number, data: UserPermissionsUpdate) {
    return apiClient.put(`/admin/users/${userId}/part-permissions`, data)
  },

  // ─── RBAC ───────────────────────────────────────────

  /** 역할 목록 조회 (권한 포함) */
  getRoles() {
    return apiClient
      .get<RoleWithPermissions[]>('/admin/rbac/roles')
      .then((r) => r.data)
  },

  /** 역할 생성 */
  createRole(data: RoleCreate) {
    return apiClient
      .post<Role>('/admin/rbac/roles', data)
      .then((r) => r.data)
  },

  /** 권한 목록 조회 */
  getPermissions() {
    return apiClient
      .get<Permission[]>('/admin/rbac/permissions')
      .then((r) => r.data)
  },

  /** 권한 생성 */
  createPermission(data: PermissionCreate) {
    return apiClient
      .post<Permission>('/admin/rbac/permissions', data)
      .then((r) => r.data)
  },

  /** 사용자에게 역할 할당 */
  assignRole(data: RoleAssignmentRequest) {
    return apiClient.post('/admin/rbac/assign-role', data)
  },

  /** 사용자에게서 역할 회수 */
  revokeRole(data: RoleAssignmentRequest) {
    return apiClient.post('/admin/rbac/revoke-role', data)
  },

  /** 역할에 권한 할당 */
  assignPermissionToRole(data: PermissionAssignmentRequest) {
    return apiClient.post('/admin/rbac/assign-permission-to-role', data)
  },

  /** 역할에서 권한 회수 */
  revokePermissionFromRole(data: PermissionAssignmentRequest) {
    return apiClient.post('/admin/rbac/revoke-permission-from-role', data)
  },

  // ─── LLM Settings ──────────────────────────────────

  /** LLM API 키 상태 조회 */
  getLlmSettings() {
    return apiClient
      .get<LlmSettings>('/admin/settings/llm')
      .then((r) => r.data)
  },

  /** LLM API 키 업데이트 */
  updateLlmSettings(data: LlmSettingsUpdate) {
    return apiClient
      .put<LlmSettings>('/admin/settings/llm', data)
      .then((r) => r.data)
  },

  // ─── Discord Role Mapping ──────────────────────────

  /** Discord 역할 매핑 목록 */
  getDiscordRoles() {
    return apiClient
      .get<DiscordRoleMapping[]>('/admin/discord/roles')
      .then((r) => r.data)
  },

  /** Discord 역할 매핑 생성/수정 */
  createDiscordRoleMapping(data: DiscordRoleMappingCreate) {
    return apiClient
      .post<DiscordRoleMapping>('/admin/discord/roles/mapping', data)
      .then((r) => r.data)
  },
}
