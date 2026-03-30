/**
 * API 응답 타입 정의
 * docs/api.json (OpenAPI 3.1.0) 스키마를 기반으로 생성
 */

// ─── Enums ───────────────────────────────────────────────

export type MeetingStatus =
  | 'RECORDING'
  | 'STOPPED'
  | 'PROCESSING'
  | 'TRANSCRIBED'
  | 'SUMMARIZED'
  | 'UPLOADED'
  | 'FAILED'

export type PromptType = 'system' | 'prefix' | 'suffix'

// ─── Auth ────────────────────────────────────────────────

export interface DiscordCodeExchangeRequest {
  code: string
}

export interface LoginResponse {
  access_token: string
  token_type: string
  user: User
}

// ─── User ────────────────────────────────────────────────

export interface User {
  id: number
  username: string
  email: string
  is_active: boolean
  is_verified: boolean
  created_at: string
  updated_at: string
  last_login_at: string | null
  discord_id?: string | null
  avatar_url?: string | null
  roles: string[]
  permissions: string[]
  authorized_part_ids: number[]
}

export interface UserUpdate {
  username: string
  email: string
}

export interface UserPermissionsUpdate {
  part_ids: number[]
}

// ─── Meeting ─────────────────────────────────────────────

export interface Artifacts {
  audio_path: string | null
  transcript_path: string | null
  summary_paths: string[] | null
  share_url: string | null
}

export interface Meeting {
  id: string
  project: string
  part: string
  author_id: number
  author_nick: string
  guild_id: number
  status: MeetingStatus
  start_time: string
  artifacts: Artifacts | null
  deleted_at: string | null
}

export interface MeetingListResponse {
  items: Meeting[]
  total: number
  page: number
  limit: number
  total_pages: number
}

export interface MeetingQueryParams {
  page?: number
  limit?: number
  project?: string | null
  part?: string | null
  status?: MeetingStatus | null
  sort?: 'start_time' | 'project' | 'part' | 'status'
  order?: 'asc' | 'desc'
  search?: string | null
}

export interface TranscribeRequest {
  stt_model: string
}

export interface SummarizeRequest {
  model: string
  instruction_name: string
  keywords_name: string
}

export interface UpdateSummaryContentRequest {
  path: string
  content: string
}

export interface UploadSummaryRequest {
  summary_path: string
}

export interface UploadSummaryResponse {
  url: string
}

// ─── Project / Part ──────────────────────────────────────

export interface AsanaConfig {
  project_id: string | null
  project_field: string | null
  project_field_id: string | null
  drive_field_id: string | null
}

export interface Part {
  id: number
  name: string
  drive_folder_id: string | null
  asana_config: AsanaConfig | null
}

export interface PartCreate {
  name: string
  drive_folder_id?: string | null
  asana_config?: AsanaConfig | null
}

export interface PartUpdate {
  name: string
  drive_folder_id?: string | null
  asana_config?: AsanaConfig | null
}

export interface Project {
  id: number
  name: string
  parts: Part[]
}

export interface ProjectCreate {
  name: string
}

export interface AsanaConfigRequest {
  url: string
  field_name: string
  enum_name: string
  drive_field_name: string
}

// ─── RBAC ────────────────────────────────────────────────

export interface Permission {
  id: number
  name: string
}

export interface PermissionCreate {
  name: string
}

export interface Role {
  id: number
  name: string
}

export interface RoleCreate {
  name: string
}

export interface RoleWithPermissions {
  id: number
  name: string
  permissions: Permission[]
}

export interface RoleAssignmentRequest {
  user_id: number
  role_id: number
}

export interface PermissionAssignmentRequest {
  role_id: number
  permission_id: number
}

// ─── Discord ─────────────────────────────────────────────

export interface DiscordRoleMapping {
  role_id: number
  discord_role_id: string
  discord_role_name: string
}

export interface DiscordRoleMappingCreate {
  role_id: number
  discord_role_id: string
  discord_role_name: string
}

// ─── Prompt / Keyword ────────────────────────────────────

export interface PromptTuple {
  type: PromptType
  prompt_text: string
}

export interface PromptData {
  id: number
  name: string
  is_global: boolean
  prompts: PromptTuple[]
}

export interface PromptDataCreate {
  name: string
  is_global?: boolean
  prompts?: PromptTuple[]
}

export interface KeywordData {
  id: number
  name: string
  is_global: boolean
  keywords: Record<string, string>
}

export interface KeywordDataCreate {
  name: string
  is_global?: boolean
  keywords?: Record<string, string>
}

// ─── LLM Settings ────────────────────────────────────────

export interface LlmSettings {
  openai_api_key_set: boolean
  gemini_api_key_set: boolean
}

export interface LlmSettingsUpdate {
  openai_api_key?: string | null
  gemini_api_key?: string | null
}

// ─── Error ───────────────────────────────────────────────

export interface ValidationError {
  loc: (string | number)[]
  msg: string
  type: string
}

export interface HTTPValidationError {
  detail: ValidationError[]
}

export interface ApiError {
  status: number
  message: string
  detail?: ValidationError[]
}
