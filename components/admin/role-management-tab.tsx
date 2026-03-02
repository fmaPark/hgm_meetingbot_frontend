"use client"

import { cn } from "@/lib/utils"
import { Checkbox } from "@/components/ui/checkbox"
import type { UserRole } from "@/lib/admin-types"
import { AVAILABLE_ROLES } from "@/lib/admin-types"

interface RoleManagementTabProps {
  selectedRoles: UserRole[]
  onRolesChange: (roles: UserRole[]) => void
  showError: boolean
}

export function RoleManagementTab({
  selectedRoles,
  onRolesChange,
  showError,
}: RoleManagementTabProps) {
  function handleToggle(roleName: UserRole) {
    if (selectedRoles.includes(roleName)) {
      onRolesChange(selectedRoles.filter((r) => r !== roleName))
    } else {
      onRolesChange([...selectedRoles, roleName])
    }
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
        {AVAILABLE_ROLES.map((role) => {
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
                aria-label={role.label}
              />
              <div className="flex flex-col gap-0.5">
                <span className="text-sm font-medium text-foreground">
                  {role.label}
                </span>
                <span className="text-xs text-text-secondary">
                  {role.description}
                </span>
              </div>
            </label>
          )
        })}
      </div>
    </div>
  )
}
