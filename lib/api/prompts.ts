import apiClient from './client'
import type {
  KeywordData,
  KeywordDataCreate,
  PromptData,
  PromptDataCreate,
} from './types'

export const promptsApi = {
  // ─── Prompts ────────────────────────────────────────

  /** 프롬프트 목록 조회 */
  getPrompts() {
    return apiClient
      .get<PromptData[]>('/prompts')
      .then((r) => r.data)
  },

  /** 프롬프트 상세 조회 */
  getPrompt(promptId: number) {
    return apiClient
      .get<PromptData>(`/prompts/${promptId}`)
      .then((r) => r.data)
  },

  /** 프롬프트 생성 */
  createPrompt(data: PromptDataCreate) {
    return apiClient
      .post<PromptData>('/prompts', data)
      .then((r) => r.data)
  },

  /** 프롬프트 수정 */
  updatePrompt(promptId: number, data: PromptDataCreate) {
    return apiClient
      .put<PromptData>(`/prompts/${promptId}`, data)
      .then((r) => r.data)
  },

  /** 프롬프트 삭제 */
  deletePrompt(promptId: number) {
    return apiClient.delete(`/prompts/${promptId}`)
  },

  // ─── Keywords ───────────────────────────────────────

  /** 키워드 세트 목록 조회 */
  getKeywords() {
    return apiClient
      .get<KeywordData[]>('/keywords')
      .then((r) => r.data)
  },

  /** 키워드 세트 상세 조회 */
  getKeyword(keywordId: number) {
    return apiClient
      .get<KeywordData>(`/keywords/${keywordId}`)
      .then((r) => r.data)
  },

  /** 키워드 세트 생성 */
  createKeyword(data: KeywordDataCreate) {
    return apiClient
      .post<KeywordData>('/keywords', data)
      .then((r) => r.data)
  },

  /** 키워드 세트 수정 */
  updateKeyword(keywordId: number, data: KeywordDataCreate) {
    return apiClient
      .put<KeywordData>(`/keywords/${keywordId}`, data)
      .then((r) => r.data)
  },

  /** 키워드 세트 삭제 */
  deleteKeyword(keywordId: number) {
    return apiClient.delete(`/keywords/${keywordId}`)
  },

  // ─── Models ─────────────────────────────────────────

  /** 사용 가능한 LLM 모델 목록 */
  getModels() {
    return apiClient
      .get<string[]>('/models')
      .then((r) => r.data)
  },

  /** 사용 가능한 STT 모델 목록 */
  getSttModels() {
    return apiClient
      .get<string[]>('/stt-models')
      .then((r) => r.data)
  },
}
