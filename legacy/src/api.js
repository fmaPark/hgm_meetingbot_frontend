// src/api.js
import axios from 'axios';
import router from './router'; // 라우터 인스턴스 가져오기

const apiClient = axios.create({
  baseURL: '/api', // FastAPI 서버 주소
  headers: {
    'Content-Type': 'application/json',
  },
});

const api = {
  getModels() {
    return apiClient.get('/models').then(response => response.data);
  },
  getSttModels() {
    return apiClient.get('/stt-models').then(response => response.data);
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
  transcribeMeeting(meetingId, data) {
    return apiClient.post(`/meetings/${meetingId}/transcribe`, data).then(response => response.data);
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
  logout() {
    localStorage.removeItem('user-token');
    localStorage.removeItem('refresh-token');
    localStorage.removeItem('current-user');
    this.setAuthHeader(null); 
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
  // New function to exchange Discord authorization code for app tokens
  exchangeDiscordCode(code) {
    return apiClient.post('/auth/discord/exchange-code', { code }).then(response => response.data);
  }
};
const token = localStorage.getItem('user-token');
if (token) {
  api.setAuthHeader(token);
}

// Axios 응답 인터셉터 추가
apiClient.interceptors.response.use(
  (response) => response, // 성공적인 응답은 그대로 반환
  async (error) => {
    const originalRequest = error.config;
    
    // 401 에러이고, 재시도한 요청이 아닐 경우
    if (error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true; // 재시도 플래그 설정

      // /token/refresh 요청 자체에서 401이 발생하면 무한 루프를 방지하기 위해 즉시 로그아웃
      if (originalRequest.url === '/token/refresh') {
        api.logout();
        router.push('/login');
        return Promise.reject(error);
      }

      try {
        const refreshToken = localStorage.getItem('refresh-token');
        if (!refreshToken) {
          throw new Error("No refresh token available");
        }

        // 새 액세스 토큰 요청
        const response = await apiClient.post('/token/refresh', {}, {
          headers: { 'Authorization': `Bearer ${refreshToken}` }
        });

        const { access_token, user } = response.data;

        // 새 토큰과 사용자 정보를 저장
        localStorage.setItem('user-token', access_token);
        localStorage.setItem('current-user', JSON.stringify(user));
        
        // API 클라이언트의 기본 헤더 업데이트
        api.setAuthHeader(access_token);
        
        // 실패했던 원래 요청의 헤더를 업데이트하여 재요청
        originalRequest.headers['Authorization'] = `Bearer ${access_token}`;
        return apiClient(originalRequest);

      } catch (refreshError) {
        // 리프레시 토큰이 실패하면 모든 인증 정보를 지우고 로그인 페이지로 리디렉션
        api.logout();
        // router.push('/login')을 사용하면 현재 실패한 API 호출의 promise가 reject되지 않아
        // 대시보드 등에서 에러를 계속 처리하려고 할 수 있습니다.
        // window.location을 사용해 페이지를 완전히 새로고침하여 상태를 초기화합니다.
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    
    // 401 에러가 아니거나 재시도 요청인 경우 에러를 그대로 반환
    return Promise.reject(error);
  }
);


export default api;