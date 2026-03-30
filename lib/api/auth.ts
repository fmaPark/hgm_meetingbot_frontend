import apiClient from './client'
import type { DiscordCodeExchangeRequest, LoginResponse } from './types'

export const authApi = {
  /** Discord OAuth 코드를 토큰으로 교환 */
  exchangeDiscordCode(data: DiscordCodeExchangeRequest) {
    return apiClient
      .post<LoginResponse>('/auth/discord/exchange-code', data)
      .then((r) => r.data)
  },

  /** 리프레시 토큰으로 액세스 토큰 갱신 */
  refreshToken(refreshToken: string) {
    return apiClient
      .post<LoginResponse>('/token/refresh', {}, {
        headers: { Authorization: `Bearer ${refreshToken}` },
      })
      .then((r) => r.data)
  },

  /** 로컬 인증 정보 삭제 */
  logout() {
    localStorage.removeItem('user-token')
    localStorage.removeItem('refresh-token')
    localStorage.removeItem('current-user')
  },
}
