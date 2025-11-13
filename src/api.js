// src/api.js
import axios from 'axios';

const apiClient = axios.create({
  baseURL: '/api', // FastAPI 서버 주소
  headers: {
    'Content-Type': 'application/json',
  },
});

const api = {
  getProjects() {
    return apiClient.get('/projects');
  },
  createProject(data) {
    return apiClient.post('/projects', data);
  },
  addPart(projectName, partData) {
    return apiClient.post(`/projects/${projectName}/parts`, partData);
  },
  updatePart(partId, partData) {
    return apiClient.put(`/parts/${partId}`, partData);
  },
  getMeetings() {
    return apiClient.get('/meetings');
  },
  getPrompts(meetingId) {
    return apiClient.get(`/meetings/${meetingId}/prompts`);
  },
  summarizeMeeting(meetingId, prompt) {
    return apiClient.post(`/meetings/${meetingId}/summarize`, { prompt: prompt });
  },
  getSummaryContent(meetingId, path) {
    // 경로를 URL 쿼리 파라미터로 전달
    return apiClient.get(`/meetings/${meetingId}/summary-content?path=${encodeURIComponent(path)}`);
  },
  uploadSummary(meetingId, summaryPath) {
    return apiClient.post(`/meetings/${meetingId}/upload-summary`, { summary_path: summaryPath });
  },
  getAsanaConfigFromUrl(data) {
    // data 객체는 { url, field_name, enum_name, drive_field_name } 형태
    return apiClient.post('/asana/config-from-url', data);
  },
  setAuthHeader(token) {
    if (token) {
      apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete apiClient.defaults.headers.common['Authorization'];
    }
  },
  login(username, password) {
    const params = new URLSearchParams();
    params.append('username', username);
    params.append('password', password);
    return apiClient.post('/token', params, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });
  },
  getPendingSignupRequests() {
    return apiClient.get('/admin/signup-requests');
  },
  approveSignupRequest(requestId) {
    return apiClient.post(`/admin/signup-requests/${requestId}/approve`);
  },
  rejectSignupRequest(requestId) {
    return apiClient.post(`/admin/signup-requests/${requestId}/reject`);
  },
  logout() {
    // 1. localStorage에서 토큰 삭제
    localStorage.removeItem('user-token');
    // 2. axios 헤더에서 토큰 정보 제거 (setAuthHeader 재활용)
    this.setAuthHeader(null); 
  },
  createSignupRequest(data) {
    return apiClient.post('/signup-request', data);
  },
  checkAdmin() {
    return apiClient.get('/admin/check');
  },
  getAllUsers() {
    return apiClient.get('/admin/users');
  },
  updateUserPermissions(userId, partIds) {
    return apiClient.put(`/admin/users/${userId}/permissions`, { part_ids: partIds });
  },
};
// const token = localStorage.getItem('user-token');
// if (token) {
//   api.setAuthHeader(token);
// }

export default api;