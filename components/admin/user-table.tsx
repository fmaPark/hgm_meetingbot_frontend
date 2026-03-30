"use client"

import { Settings, ChevronUp, ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table"
import type { AdminUser, UserSortConfig, UserSortField } from "@/lib/admin-types"
import {
  getRoleBadgeStyle,
  STATUS_BADGE_STYLES,
  getInitials,
  formatPartAccessLabel,
} from "@/lib/admin-types"

interface UserTableProps {
  users: AdminUser[]
  sort: UserSortConfig
  onSortChange: (field: UserSortField) => void
  onPermissionSettings: (user: AdminUser) => void
  loading?: boolean
}

function SortIcon({ field, sort }: { field: UserSortField; sort: UserSortConfig }) {
  if (sort.field !== field) {
    return <ChevronDown className="size-3.5 text-muted-foreground/40" />
  }
  return sort.direction === "asc" ? (
    <ChevronUp className="size-3.5 text-foreground" />
  ) : (
    <ChevronDown className="size-3.5 text-foreground" />
  )
}

function PartAccessCell({ user }: { user: AdminUser }) {
  const isAdmin = user.roles.includes("admin")
  const label = formatPartAccessLabel(user.authorizedPartIds, isAdmin)

  if (isAdmin) {
    return (
      <Badge className="border-transparent bg-green-100 text-green-800 hover:bg-green-100">
        전체 접근
      </Badge>
    )
  }

  if (user.authorizedPartIds.length === 0) {
    return <span className="text-sm text-gray-400">접근 없음</span>
  }

  return (
    <span className="text-sm text-foreground">{label}</span>
  )
}

export function UserTable({
  users,
  sort,
  onSortChange,
  onPermissionSettings,
  loading = false,
}: UserTableProps) {
  const sortableHeaders: { field: UserSortField; label: string; width: string }[] = [
    { field: "name", label: "프로필", width: "w-[200px]" },
    { field: "email", label: "이메일", width: "w-[200px]" },
  ]

  if (loading) {
    return (
      <div className="overflow-x-auto rounded-lg border border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[200px]">프로필</TableHead>
              <TableHead className="w-[200px]">이메일</TableHead>
              <TableHead className="w-[150px]">역할</TableHead>
              <TableHead className="w-[150px]">파트 접근</TableHead>
              <TableHead className="w-[80px]">상태</TableHead>
              <TableHead className="w-[120px]">마지막 로그인</TableHead>
              <TableHead className="w-[100px]">액션</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: 5 }).map((_, i) => (
              <TableRow key={i}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Skeleton className="size-8 rounded-full" />
                    <Skeleton className="h-4 w-16" />
                  </div>
                </TableCell>
                <TableCell><Skeleton className="h-4 w-28" /></TableCell>
                <TableCell><Skeleton className="h-5 w-12" /></TableCell>
                <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                <TableCell><Skeleton className="h-5 w-10" /></TableCell>
                <TableCell><Skeleton className="h-4 w-14" /></TableCell>
                <TableCell><Skeleton className="h-8 w-20" /></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-border bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            {sortableHeaders.map((header) => (
              <TableHead
                key={header.field}
                className={cn(header.width, "cursor-pointer select-none")}
                onClick={() => onSortChange(header.field)}
              >
                <div className="flex items-center gap-1">
                  {header.label}
                  <SortIcon field={header.field} sort={sort} />
                </div>
              </TableHead>
            ))}
            <TableHead className="w-[150px]">역할</TableHead>
            <TableHead className="w-[150px]">파트 접근</TableHead>
            <TableHead className="w-[80px]">상태</TableHead>
            <TableHead
              className="w-[120px] cursor-pointer select-none"
              onClick={() => onSortChange("lastLogin")}
            >
              <div className="flex items-center gap-1">
                마지막 로그인
                <SortIcon field="lastLogin" sort={sort} />
              </div>
            </TableHead>
            <TableHead className="w-[100px]">액션</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => {
            const statusKey = user.isActive ? "active" : "inactive"
            return (
              <TableRow key={user.id}>
                {/* Profile */}
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar className="size-8">
                      {user.avatar ? (
                        <AvatarImage src={user.avatar} alt={user.name} />
                      ) : null}
                      <AvatarFallback className="bg-brand-green/10 text-xs font-medium text-brand-green">
                        {getInitials(user.name)}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm font-medium text-foreground">
                      {user.name}
                    </span>
                  </div>
                </TableCell>

                {/* Email */}
                <TableCell className="text-sm text-text-secondary">
                  {user.email}
                </TableCell>

                {/* Roles */}
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {user.roles.map((role) => {
                      const style = getRoleBadgeStyle(role)
                      return (
                        <Badge
                          key={role}
                          className={cn(
                            "border-transparent hover:opacity-100",
                            style.bg,
                            style.text
                          )}
                        >
                          {style.label}
                        </Badge>
                      )
                    })}
                  </div>
                </TableCell>

                {/* Part Access */}
                <TableCell>
                  <PartAccessCell user={user} />
                </TableCell>

                {/* Status */}
                <TableCell>
                  <Badge
                    className={cn(
                      "border-transparent",
                      STATUS_BADGE_STYLES[statusKey].bg,
                      STATUS_BADGE_STYLES[statusKey].text
                    )}
                  >
                    {STATUS_BADGE_STYLES[statusKey].label}
                  </Badge>
                </TableCell>

                {/* Last Login */}
                <TableCell className="text-sm text-text-secondary">
                  {user.lastLogin}
                </TableCell>

                {/* Action */}
                <TableCell>
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1.5 text-xs"
                    onClick={() => onPermissionSettings(user)}
                  >
                    <Settings className="size-3.5" />
                    권한 설정
                  </Button>
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}
