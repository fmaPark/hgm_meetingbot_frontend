'use client'

import { useAuthStore } from '@/lib/stores/auth-store'

/** 단일 권한 체크 */
export function usePermission(permission: string): boolean {
  return useAuthStore((s) => s.hasPermission(permission))
}

/** 복수 권한 중 하나라도 보유 여부 */
export function useAnyPermission(permissions: string[]): boolean {
  return useAuthStore((s) => s.hasAnyPermission(permissions))
}

/** 사용자의 파트 접근 권한 체크 */
export function usePartAccess(partId: number): boolean {
  return useAuthStore((s) => {
    if (!s.user) return false
    // admin은 모든 파트 접근 가능
    if (s.user.roles.includes('admin')) return true
    return s.user.authorized_part_ids.includes(partId)
  })
}
