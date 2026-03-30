"use client"

import { useCallback, useMemo, useEffect, useRef } from "react"
import { Minus, Trash2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { ALL_PERMISSIONS, ALL_PERMISSION_NAMES } from "@/lib/rbac-types"
import type { RoleFormState } from "@/lib/rbac-types"
import type { RoleWithPermissions } from "@/lib/api/types"

interface RolePermissionFormProps {
  form: RoleFormState
  originalRole: RoleWithPermissions | null
  isNew: boolean
  hasChanges: boolean
  onFormChange: (form: RoleFormState) => void
  onSave: () => void
  onDelete: () => void
  loading?: boolean
  /** Validation error for role name */
  nameError: string | null
}

export function RolePermissionForm({
  form,
  originalRole,
  isNew,
  hasChanges,
  onFormChange,
  onSave,
  onDelete,
  loading = false,
  nameError,
}: RolePermissionFormProps) {
  const nameInputRef = useRef<HTMLInputElement>(null)

  // Auto-focus name input on new role
  useEffect(() => {
    if (isNew && nameInputRef.current) {
      nameInputRef.current.focus()
    }
  }, [isNew])

  const allSelected = useMemo(
    () => ALL_PERMISSION_NAMES.every((p) => form.permissions.includes(p)),
    [form.permissions]
  )

  const someSelected = useMemo(
    () =>
      form.permissions.length > 0 &&
      !ALL_PERMISSION_NAMES.every((p) => form.permissions.includes(p)),
    [form.permissions]
  )

  const handleToggleAll = useCallback(() => {
    if (allSelected) {
      onFormChange({ ...form, permissions: [] })
    } else {
      onFormChange({ ...form, permissions: [...ALL_PERMISSION_NAMES] })
    }
  }, [allSelected, form, onFormChange])

  const handleTogglePermission = useCallback(
    (permName: string) => {
      const exists = form.permissions.includes(permName)
      onFormChange({
        ...form,
        permissions: exists
          ? form.permissions.filter((p) => p !== permName)
          : [...form.permissions, permName],
      })
    },
    [form, onFormChange]
  )

  if (loading) {
    return (
      <div className="flex flex-col gap-4 p-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-px w-full" />
        <Skeleton className="h-6 w-32" />
        <div className="grid grid-cols-2 gap-3">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-6 w-full" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 overflow-y-auto p-6">
        <h2 className="mb-6 text-base font-semibold text-foreground">
          {isNew ? "새 역할 생성" : "권한 설정"}
        </h2>

        {/* Role name input */}
        <div className="mb-6">
          <label
            htmlFor="role-name"
            className="mb-1.5 block text-sm font-medium text-foreground"
          >
            역할명 <span className="text-destructive">*</span>
          </label>
          <Input
            id="role-name"
            ref={nameInputRef}
            value={form.name}
            onChange={(e) =>
              onFormChange({ ...form, name: e.target.value })
            }
            placeholder="역할명 입력 (한글/영문/숫자/언더스코어)"
            className={cn(
              "text-sm",
              nameError && "border-destructive focus-visible:ring-destructive"
            )}
          />
          {nameError && (
            <p className="mt-1 text-xs text-destructive">{nameError}</p>
          )}
        </div>

        <Separator />

        {/* Permissions section */}
        <div className="mt-6">
          <h3 className="mb-4 text-sm font-semibold text-foreground">
            권한 설정
          </h3>

          {/* Select all */}
          <div className="mb-4 flex items-center gap-2">
            <div className="relative flex items-center">
              <Checkbox
                id="select-all"
                checked={allSelected}
                onCheckedChange={handleToggleAll}
              />
              {/* Indeterminate overlay */}
              {someSelected && (
                <button
                  type="button"
                  onClick={handleToggleAll}
                  className="absolute inset-0 flex items-center justify-center rounded-sm border border-brand-green bg-brand-green text-primary-foreground"
                  aria-label="전체 선택 해제"
                >
                  <Minus className="size-3" />
                </button>
              )}
            </div>
            <label
              htmlFor="select-all"
              className="cursor-pointer text-sm font-medium text-foreground"
            >
              전체 선택
            </label>
          </div>

          {/* Permission checkboxes - 2 column grid */}
          <div className="grid grid-cols-1 gap-x-6 gap-y-3 sm:grid-cols-2">
            {ALL_PERMISSIONS.map((perm, idx) => {
              const isChecked = form.permissions.includes(perm.name)
              return (
                <div key={perm.name} className="flex items-center gap-2">
                  <Checkbox
                    id={`perm-${idx}`}
                    checked={isChecked}
                    onCheckedChange={() => handleTogglePermission(perm.name)}
                  />
                  <label
                    htmlFor={`perm-${idx}`}
                    className="cursor-pointer text-sm text-foreground"
                  >
                    <span className="font-mono text-xs text-muted-foreground">
                      {perm.name}
                    </span>
                    <span className="ml-1.5 text-text-secondary">
                      ({perm.label})
                    </span>
                  </label>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between border-t border-border px-6 py-4">
        <div>
          {!isNew && originalRole && (
            <Button
              variant="destructive"
              size="sm"
              onClick={onDelete}
              className="gap-1.5"
            >
              <Trash2 className="size-4" />
              삭제
            </Button>
          )}
        </div>
        <Button
          size="sm"
          onClick={onSave}
          disabled={!hasChanges && !isNew}
          className="min-w-[80px]"
        >
          저장
        </Button>
      </div>
    </div>
  )
}

/** Empty state when no role is selected */
export function RolePermissionEmpty() {
  return (
    <div className="flex h-full min-h-[400px] flex-col items-center justify-center gap-2 text-muted-foreground">
      <p className="text-sm">역할을 선택하세요</p>
    </div>
  )
}
