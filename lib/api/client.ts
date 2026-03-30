import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios'

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL ?? '/api',
  headers: { 'Content-Type': 'application/json' },
  timeout: 30_000,
})

// ─── Request Interceptor ─────────────────────────────────

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('user-token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// ─── Response Interceptor (Token Refresh) ────────────────
// Legacy api.js 라인 132-187 패턴 포팅 + 동시 401 큐잉 개선

let isRefreshing = false
let failedQueue: {
  resolve: (token: string) => void
  reject: (error: unknown) => void
}[] = []

function processQueue(error: unknown, token: string | null) {
  failedQueue.forEach(({ resolve, reject }) => {
    if (token) resolve(token)
    else reject(error)
  })
  failedQueue = []
}

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean }
    if (!originalRequest || !error.response) {
      return Promise.reject(error)
    }

    if (error.response.status !== 401 || originalRequest._retry) {
      return Promise.reject(error)
    }

    // /token/refresh 자체에서 401 → 무한루프 방지, 즉시 로그아웃
    if (originalRequest.url === '/token/refresh') {
      forceLogout()
      return Promise.reject(error)
    }

    // 이미 갱신 중이면 큐에 대기
    if (isRefreshing) {
      return new Promise<string>((resolve, reject) => {
        failedQueue.push({ resolve, reject })
      }).then((token) => {
        originalRequest.headers.Authorization = `Bearer ${token}`
        return apiClient(originalRequest)
      })
    }

    originalRequest._retry = true
    isRefreshing = true

    try {
      const refreshToken = localStorage.getItem('refresh-token')
      if (!refreshToken) {
        throw new Error('No refresh token available')
      }

      const { data } = await apiClient.post('/token/refresh', {}, {
        headers: { Authorization: `Bearer ${refreshToken}` },
      })

      const { access_token, user } = data
      localStorage.setItem('user-token', access_token)
      localStorage.setItem('current-user', JSON.stringify(user))

      processQueue(null, access_token)

      originalRequest.headers.Authorization = `Bearer ${access_token}`
      return apiClient(originalRequest)
    } catch (refreshError) {
      processQueue(refreshError, null)
      forceLogout()
      return Promise.reject(refreshError)
    } finally {
      isRefreshing = false
    }
  },
)

function forceLogout() {
  localStorage.removeItem('user-token')
  localStorage.removeItem('refresh-token')
  localStorage.removeItem('current-user')
  window.location.href = '/login'
}

export default apiClient
