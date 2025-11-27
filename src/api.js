// src/api.js
import axios from 'axios';
import router from './router'; // 라우터 인스턴스 가져오기

const apiClient = axios.create({
  baseURL: '/api', // FastAPI 서버 주소
  headers: {
    'Content-Type': 'application/json',
  },
});

// Axios 응답 인터셉터 추가
apiClient.interceptors.response.use(
  (response) => {
    // 2xx 범위에 있는 상태 코드는 이 함수를 트리거합니다.
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // 1. 토큰 재발급 요청 자체에서 에러가 발생한 경우 (예: 리프레시 토큰 만료)
    // 이 경우, 무한 루프를 방지하기 위해 즉시 로그아웃 처리합니다.
    if (originalRequest.url === '/token/refresh') {
      console.error("Refresh token is invalid or expired. Logging out.", error);
      api.logout(); // 아래 api 객체가 정의된 후에야 사용 가능하므로, 위치에 주의해야 합니다.
      router.push({ name: 'Login' });
      return Promise.reject(error);
    }

    // 2. 그 외의 401 에러이며, 아직 재시도되지 않은 요청인 경우
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        const refreshResponse = await api.refreshToken();
        const { access_token, refresh_token } = refreshResponse.data;

        localStorage.setItem('user-token', access_token);
        localStorage.setItem('refresh-token', refresh_token);
        
        // api.setAuthHeader를 통해 apiClient의 기본 헤더를 업데이트합니다.
        api.setAuthHeader(access_token);
        
        // 실패했던 원래 요청의 헤더도 새로운 토큰으로 교체합니다.
        originalRequest.headers['Authorization'] = `Bearer ${access_token}`;
        
        // 원래 요청을 다시 실행합니다.
        return apiClient(originalRequest);
      } catch (refreshError) {
        console.error("Unable to refresh token, logging out.", refreshError);
        api.logout();
        router.push({ name: 'Login' });
        return Promise.reject(refreshError);
      }
    }
    
    // 그 외 모든 에러는 그대로 반환합니다.
    return Promise.reject(error);
  }
);


const api = {
  getModels() {
    return apiClient.get('/models').then(response => response.data);
  },
  getProjects() {
    return apiClient.get('/projects').then(response => response.data);
  },
  createProject(data) {
    return apiClient.post('/projects', data).then(response => response.data);
  },
  addPart(projectName, partData) {
    return apiClient.post(`/projects/${projectName}/parts`, partData).then(response => response.data);
  },
  updatePart(partId, partData) {
    return apiClient.put(`/parts/${partId}`, partData).then(response => response.data);
  },
  getMeetings() {
    return apiClient.get('/meetings').then(response => response.data);
  },
  getPrompts() {
    return apiClient.get('/prompts').then(response => response.data);
  },
  createPrompt(data) {
    return apiClient.post('/prompts', data).then(response => response.data);
  },
  updatePrompt(id, data) {
    return apiClient.put(`/prompts/${id}`, data).then(response => response.data);
  },
  deletePrompt(id) {
    return apiClient.delete(`/prompts/${id}`).then(response => response.data);
  },
  getKeywords() {
    return apiClient.get('/keywords').then(response => response.data);
  },
  createKeyword(data) {
    return apiClient.post('/keywords', data).then(response => response.data);
  },
  updateKeyword(id, data) {
    return apiClient.put(`/keywords/${id}`, data).then(response => response.data);
  },
  deleteKeyword(id) {
    return apiClient.delete(`/keywords/${id}`).then(response => response.data);
  },
  summarizeMeeting(meetingId, data) {
    return apiClient.post(`/meetings/${meetingId}/summarize`, data).then(response => response.data);
  },
  getSummaryContent(meetingId, path) {
    return apiClient.get(`/meetings/${meetingId}/summary-content?path=${encodeURIComponent(path)}`).then(response => response.data);
  },
  uploadSummary(meetingId, summaryPath) {
    return apiClient.post(`/meetings/${meetingId}/upload-summary`, { summary_path: summaryPath }).then(response => response.data);
  },
  getAsanaConfigFromUrl(data) {
    return apiClient.post('/asana/config-from-url', data).then(response => response.data);
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
    }).then(response => {
      localStorage.setItem('user-token', response.data.access_token);
      localStorage.setItem('refresh-token', response.data.refresh_token);
      return response.data;
    });
  },
  refreshToken() {
    const refreshToken = localStorage.getItem('refresh-token');
    if (!refreshToken) {
      return Promise.reject(new Error('No refresh token available.'));
    }
    const params = new URLSearchParams();
    params.append('refresh_token', refreshToken);
    // This one is special, it's called by the interceptor which needs the full response
    return apiClient.post('/token/refresh', params, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });
  },
  getPendingSignupRequests() {
    return apiClient.get('/admin/signup-requests').then(response => response.data);
  },
  approveSignupRequest(requestId) {
    return apiClient.post(`/admin/signup-requests/${requestId}/approve`).then(response => response.data);
  },
  rejectSignupRequest(requestId) {
    return apiClient.post(`/admin/signup-requests/${requestId}/reject`).then(response => response.data);
  },
  logout() {
    localStorage.removeItem('user-token');
    localStorage.removeItem('refresh-token');
    this.setAuthHeader(null); 
  },
  createSignupRequest(data) {
    return apiClient.post('/signup-request', data).then(response => response.data);
  },
  checkAdmin() { //!LEGACY
    return apiClient.get('/admin/check').then(response => response.data);
  },
  getMe() { //!LEGACY
    return apiClient.get('/users/me').then(response => response.data);
  },
  getAllUsers() {
    return apiClient.get('/admin/users').then(response => response.data);
  },
  updateUserPermissions(userId, partIds) {
    return apiClient.put(`/admin/users/${userId}/part-permissions`, { part_ids: partIds }).then(response => response.data);
  },
  getRoles() {
    return apiClient.get('/admin/rbac/roles').then(response => response.data);
  },
  getPermissions() {
    return apiClient.get('/admin/rbac/permissions').then(response => response.data);
  },
  assignRole(userId, roleId) {
    return apiClient.post('/admin/rbac/assign-role', { user_id: userId, role_id: roleId }).then(response => response.data);
  },
  revokeRole(userId, roleId) {
    return apiClient.post('/admin/rbac/revoke-role', { user_id: userId, role_id: roleId }).then(response => response.data);
  },
  createRole(name) {
    return apiClient.post('/admin/rbac/roles', { name }).then(response => response.data);
  },
  createPermission(name) {
    return apiClient.post('/admin/rbac/permissions', { name }).then(response => response.data);
  },
  assignPermissionToRole(roleId, permissionId) {
    return apiClient.post('/admin/rbac/assign-permission-to-role', { role_id: roleId, permission_id: permissionId }).then(response => response.data);
  },
  revokePermissionFromRole(roleId, permissionId) {
    return apiClient.post('/admin/rbac/revoke-permission-from-role', { role_id: roleId, permission_id: permissionId }).then(response => response.data);
  },
  getLlmSettings() {
    return apiClient.get('/admin/settings/llm').then(response => response.data);
  },
  updateLlmSettings(settings) {
    return apiClient.put('/admin/settings/llm', settings).then(response => response.data);
  },
};
const token = localStorage.getItem('user-token');
if (token) {
  api.setAuthHeader(token);
}

export default api;