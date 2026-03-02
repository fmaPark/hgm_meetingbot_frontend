"use client"

import { Plus } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import type { Role } from "@/lib/rbac-types"

interface RoleListPanelProps {
  roles: Role[]
  selectedId: number | null
  onSelect: (role: Role) => void
  onAddNew: () => void
  loading: boolean
  /** Whether a new (unsaved) role is being created */
  isNewMode: boolean
}

export function RoleListPanel({
  roles,
  selectedId,
  onSelect,
  onAddNew,
  loading,
  isNewMode,
}: RoleListPanelProps) {
  if (loading) {
    return (
      <div className="flex flex-col">
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <Skeleton className="h-5 w-20" />
          <Skeleton className="h-8 w-24" />
        </div>
        <div className="flex flex-col gap-2 p-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-16 w-full rounded-lg" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <h2 className="text-base font-semibold text-foreground">역할 목록</h2>
        <Button
          size="sm"
          onClick={onAddNew}
          disabled={isNewMode}
          className="gap-1.5"
        >
          <Plus className="size-4" />
          새 역할
        </Button>
      </div>

      {/* Role cards */}
      <div className="flex-1 overflow-y-auto">
        <div className="flex flex-col gap-2 p-4">
          {/* New role placeholder card */}
          {isNewMode && (
            <div
              className="cursor-pointer rounded-lg border-l-4 border-brand-green bg-gray-100 px-4 py-3"
            >
              <p className="text-sm font-semibold text-foreground">
                새 역할
              </p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                역할명을 입력하세요
              </p>
            </div>
          )}

          {roles.map((role) => {
            const isSelected = !isNewMode && selectedId === role.id
            return (
              <button
                key={role.id}
                type="button"
                onClick={() => onSelect(role)}
                className={cn(
                  "w-full rounded-lg border border-border px-4 py-3 text-left transition-colors hover:bg-gray-50",
                  isSelected && "border-l-4 border-l-brand-green bg-gray-100"
                )}
              >
                <p className="text-sm font-semibold text-foreground">
                  {role.name}
                </p>
                <p className="mt-0.5 line-clamp-1 text-xs text-text-secondary">
                  {role.description || "설명 없음"}
                </p>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
