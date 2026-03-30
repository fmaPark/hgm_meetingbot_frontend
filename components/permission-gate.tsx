'use client'

import type { ReactNode } from 'react'
import { useAuthStore } from '@/lib/stores/auth-store'

interface PermissionGateProps {
  /** 필요한 권한 (하나라도 보유 시 통과) */
  permissions: string[]
  /** 권한이 없을 때 표시할 fallback */
  fallback?: ReactNode
  children: ReactNode
}

export function PermissionGate({ permissions, fallback = null, children }: PermissionGateProps) {
  const hasAnyPermission = useAuthStore((s) => s.hasAnyPermission(permissions))

  if (!hasAnyPermission) return <>{fallback}</>
  return <>{children}</>
}
