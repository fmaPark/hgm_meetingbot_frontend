"use client"

import { Settings } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Skeleton } from "@/components/ui/skeleton"
import type { AdminUser } from "@/lib/admin-types"
import {
  ROLE_BADGE_STYLES,
  STATUS_BADGE_STYLES,
  getInitials,
  formatPartAccess,
} from "@/lib/admin-types"

interface UserCardListProps {
  users: AdminUser[]
  onPermissionSettings: (user: AdminUser) => void
  loading?: boolean
}

export function UserCardList({
  users,
  onPermissionSettings,
  loading = false,
}: UserCardListProps) {
  if (loading) {
    return (
      <div className="flex flex-col gap-2 px-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="rounded-lg border border-border bg-card p-4"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Skeleton className="size-8 rounded-full" />
                <Skeleton className="h-4 w-16" />
              </div>
              <Skeleton className="h-5 w-12" />
            </div>
            <div className="mt-3 flex items-center justify-between">
              <Skeleton className="h-3 w-28" />
              <Skeleton className="h-5 w-10" />
            </div>
            <div className="mt-3 flex items-center justify-between">
              <Skeleton className="h-3 w-16" />
              <Skeleton className="h-8 w-20" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-2 px-4">
      {users.map((user) => {
        const access = formatPartAccess(user.partAccess)

        return (
          <div
            key={user.id}
            className="rounded-lg border border-border bg-card p-4"
          >
            {/* Top: Avatar + Name | Role badges */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Avatar className="size-8">
                  {user.avatar ? (
                    <AvatarImage src={user.avatar} alt={user.name} />
                  ) : null}
                  <AvatarFallback className="bg-brand-green/10 text-xs font-medium text-brand-green">
                    {getInitials(user.name)}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm font-semibold text-foreground">
                  {user.name}
                </span>
              </div>
              <div className="flex gap-1">
                {user.roles.map((role) => {
                  const style = ROLE_BADGE_STYLES[role] ?? ROLE_BADGE_STYLES.other
                  return (
                    <Badge
                      key={role}
                      className={cn(
                        "border-transparent text-[10px]",
                        style.bg,
                        style.text
                      )}
                    >
                      {style.label}
                    </Badge>
                  )
                })}
              </div>
            </div>

            {/* Middle: Email | Status */}
            <div className="mt-3 flex items-center justify-between">
              <span className="text-xs text-text-secondary">
                {user.email}
              </span>
              <Badge
                className={cn(
                  "border-transparent text-[10px]",
                  STATUS_BADGE_STYLES[user.status].bg,
                  STATUS_BADGE_STYLES[user.status].text
                )}
              >
                {STATUS_BADGE_STYLES[user.status].label}
              </Badge>
            </div>

            {/* Bottom: Part access info | Settings button */}
            <div className="mt-3 flex items-center justify-between">
              <div className="text-xs text-text-secondary">
                {access.type === "all" ? (
                  <Badge className="border-transparent bg-green-100 text-[10px] text-green-800 hover:bg-green-100">
                    전체 접근
                  </Badge>
                ) : access.type === "none" ? (
                  <span className="text-gray-400">접근 없음</span>
                ) : (
                  <span>{access.label}</span>
                )}
              </div>
              <Button
                variant="outline"
                size="sm"
                className="min-h-[44px] gap-1.5 text-xs"
                onClick={() => onPermissionSettings(user)}
              >
                <Settings className="size-3.5" />
                권한 설정
              </Button>
            </div>
          </div>
        )
      })}
    </div>
  )
}
