'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { User } from '@/lib/api/types'

interface AuthState {
  user: User | null
  token: string | null
  refreshToken: string | null
  isAuthenticated: boolean

  setAuth: (user: User, token: string, refreshToken: string) => void
  updateUser: (user: User) => void
  clearAuth: () => void
  hasPermission: (permission: string) => boolean
  hasAnyPermission: (permissions: string[]) => boolean
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      refreshToken: null,
      isAuthenticated: false,

      setAuth: (user, token, refreshToken) => {
        localStorage.setItem('user-token', token)
        localStorage.setItem('refresh-token', refreshToken)
        localStorage.setItem('current-user', JSON.stringify(user))
        set({ user, token, refreshToken, isAuthenticated: true })
      },

      updateUser: (user) => {
        localStorage.setItem('current-user', JSON.stringify(user))
        set({ user })
      },

      clearAuth: () => {
        localStorage.removeItem('user-token')
        localStorage.removeItem('refresh-token')
        localStorage.removeItem('current-user')
        set({ user: null, token: null, refreshToken: null, isAuthenticated: false })
      },

      hasPermission: (permission) => {
        const { user } = get()
        if (!user) return false
        return user.permissions.includes(permission)
      },

      hasAnyPermission: (permissions) => {
        const { user } = get()
        if (!user) return false
        return permissions.some((p) => user.permissions.includes(p))
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
)
