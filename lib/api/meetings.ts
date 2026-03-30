import apiClient from './client'
import type {
  Meeting,
  MeetingListResponse,
  MeetingQueryParams,
  SummarizeRequest,
  TranscribeRequest,
  UpdateSummaryContentRequest,
  UploadSummaryRequest,
  UploadSummaryResponse,
} from './types'

export const meetingsApi = {
  /** 회의 목록 조회 (페이지네이션, 필터, 정렬) */
  getMeetings(params?: MeetingQueryParams) {
    return apiClient
      .get<MeetingListResponse>('/meetings', { params })
      .then((r) => r.data)
  },

  /** 삭제된 회의 목록 조회 */
  getDeletedMeetings() {
    return apiClient
      .get<Meeting[]>('/meetings/deleted')
      .then((r) => r.data)
  },

  /** 회의 삭제 (휴지통 이동) */
  deleteMeeting(meetingId: string) {
    return apiClient.delete(`/meetings/${meetingId}`)
  },

  /** 삭제된 회의 복구 */
  restoreMeeting(meetingId: string) {
    return apiClient
      .post<Meeting>(`/meetings/${meetingId}/restore`)
      .then((r) => r.data)
  },

  /** STT 변환 시작 */
  transcribeMeeting(meetingId: string, data: TranscribeRequest) {
    return apiClient
      .post<Meeting>(`/meetings/${meetingId}/transcribe`, data)
      .then((r) => r.data)
  },

  /** 트랜스크립트 조회 */
  getTranscript(meetingId: string) {
    return apiClient
      .get<string>(`/meetings/${meetingId}/transcript`)
      .then((r) => r.data)
  },

  /** AI 요약 시작 */
  summarizeMeeting(meetingId: string, data: SummarizeRequest) {
    return apiClient
      .post<Meeting>(`/meetings/${meetingId}/summarize`, data)
      .then((r) => r.data)
  },

  /** 요약 내용 조회 */
  getSummaryContent(meetingId: string, path: string) {
    return apiClient
      .get<string>(`/meetings/${meetingId}/summary-content`, {
        params: { path },
      })
      .then((r) => r.data)
  },

  /** 요약 내용 수정 */
  updateSummaryContent(meetingId: string, data: UpdateSummaryContentRequest) {
    return apiClient
      .put(`/meetings/${meetingId}/summary-content`, data)
  },

  /** Asana 업로드 */
  uploadSummary(meetingId: string, data: UploadSummaryRequest) {
    return apiClient
      .post<UploadSummaryResponse>(`/meetings/${meetingId}/upload-summary`, data)
      .then((r) => r.data)
  },

  /** 영구 삭제 (관리자) */
  purgeMeetings() {
    return apiClient.post('/meetings/purge')
  },
}
