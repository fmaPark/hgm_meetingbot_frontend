import apiClient from './client'
import type {
  AsanaConfig,
  AsanaConfigRequest,
  Part,
  PartCreate,
  PartUpdate,
  Project,
  ProjectCreate,
} from './types'

export const projectsApi = {
  /** 전체 프로젝트 조회 */
  getProjects() {
    return apiClient
      .get<Project[]>('/projects/')
      .then((r) => r.data)
  },

  /** 프로젝트 생성 */
  createProject(data: ProjectCreate) {
    return apiClient
      .post<Project>('/projects/', data)
      .then((r) => r.data)
  },

  /** 프로젝트 수정 */
  updateProject(projectId: number, data: ProjectCreate) {
    return apiClient
      .put<Project>(`/projects/${projectId}`, data)
      .then((r) => r.data)
  },

  /** 프로젝트 삭제 */
  deleteProject(projectId: number) {
    return apiClient.delete(`/projects/${projectId}`)
  },

  /** 파트 상세 조회 */
  getPart(partId: number) {
    return apiClient
      .get<Part>(`/projects/parts/${partId}`)
      .then((r) => r.data)
  },

  /** 프로젝트에 파트 추가 */
  addPart(projectName: string, data: PartCreate) {
    return apiClient
      .post<Project>(`/projects/${encodeURIComponent(projectName)}/parts`, data)
      .then((r) => r.data)
  },

  /** 파트 수정 */
  updatePart(partId: number, data: PartUpdate) {
    return apiClient
      .put<Project>(`/projects/parts/${partId}`, data)
      .then((r) => r.data)
  },

  /** 파트 삭제 */
  deletePart(partId: number) {
    return apiClient.delete(`/projects/parts/${partId}`)
  },

  /** 파트 Asana 설정 업데이트 */
  updateAsanaConfig(partId: number, data: AsanaConfig) {
    return apiClient
      .put<Project>(`/projects/parts/${partId}/asana-config`, data)
      .then((r) => r.data)
  },

  /** Asana URL 파싱으로 설정 자동 추출 */
  getAsanaConfigFromUrl(data: AsanaConfigRequest) {
    return apiClient
      .post<AsanaConfig>('/asana/config-from-url', data)
      .then((r) => r.data)
  },
}
