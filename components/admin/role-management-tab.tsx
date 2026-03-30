"use client"

import { cn } from "@/lib/utils"
import { Checkbox } from "@/components/ui/checkbox"
import { Skeleton } from "@/components/ui/skeleton"
import { useRoles } from "@/lib/hooks/use-admin"

interface RoleManagementTabProps {
  selectedRoles: string[]
  onRolesChange: (roles: string[]) => void
  showError: boolean
}

export function RoleManagementTab({
  selectedRoles,
  onRolesChange,
  showError,
}: RoleManagementTabProps) {
  const { data: rolesData = [], isLoading } = useRoles()

  function handleToggle(roleName: string) {
    if (selectedRoles.includes(roleName)) {
      onRolesChange(selectedRoles.filter((r) => r !== roleName))
    } else {
      onRolesChange([...selectedRoles, roleName])
    }
  }

  if (isLoading) {
    return (
      <div className="flex flex-col gap-2">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-14 w-full rounded-lg" />
        ))}
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-text-secondary">
        사용자에게 할당할 역할을 선택합니다.
      </p>

      {showError && selectedRoles.length === 0 && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2.5">
          <p className="text-sm text-red-800">
            최소 1개의 역할을 선택해야 합니다.
          </p>
        </div>
      )}

      <div className="flex flex-col gap-2">
        {rolesData.map((role) => {
          const isChecked = selectedRoles.includes(role.name)

          return (
            <label
              key={role.id}
              className={cn(
                "flex min-h-[56px] cursor-pointer items-start gap-3 rounded-lg border border-border px-3 py-3 transition-colors hover:bg-accent",
                isChecked && "border-brand-green/30 bg-brand-green/5"
              )}
            >
              <Checkbox
                checked={isChecked}
                onCheckedChange={() => handleToggle(role.name)}
                className="mt-0.5"
                aria-label={role.name}
              />
              <div className="flex flex-col gap-0.5">
                <span className="text-sm font-medium text-foreground">
                  {role.name}
                </span>
                <span className="text-xs text-text-secondary">
                  {role.permissions.length}개 권한
                </span>
              </div>
            </label>
          )
        })}
      </div>
    </div>
  )
}
