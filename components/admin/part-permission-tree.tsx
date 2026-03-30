"use client"

import { useCallback, useMemo } from "react"
import { Check, Minus, AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import { Checkbox } from "@/components/ui/checkbox"

interface ProjectTreeItem {
  id: number
  name: string
  parts: { id: number; name: string }[]
}

interface PartPermissionTreeProps {
  projectTree: ProjectTreeItem[]
  selectedPartIds: number[]
  allAccess: boolean
  roles: string[]
  onAllAccessChange: (checked: boolean) => void
  onPartsChange: (partIds: number[]) => void
  isMobile?: boolean
}

export function PartPermissionTree({
  projectTree,
  selectedPartIds,
  allAccess,
  roles,
  onAllAccessChange,
  onPartsChange,
  isMobile = false,
}: PartPermissionTreeProps) {
  const isAdmin = roles.includes("admin")
  const allPartIds = useMemo(
    () => projectTree.flatMap((p) => p.parts.map((pt) => pt.id)),
    [projectTree]
  )

  const handleProjectToggle = useCallback(
    (project: ProjectTreeItem) => {
      const projectPartIds = project.parts.map((p) => p.id)
      const allSelected = projectPartIds.every((id) => selectedPartIds.includes(id))

      if (allSelected) {
        onPartsChange(selectedPartIds.filter((id) => !projectPartIds.includes(id)))
      } else {
        const newParts = new Set([...selectedPartIds, ...projectPartIds])
        onPartsChange(Array.from(newParts))
      }
    },
    [selectedPartIds, onPartsChange]
  )

  const handlePartToggle = useCallback(
    (partId: number) => {
      if (selectedPartIds.includes(partId)) {
        onPartsChange(selectedPartIds.filter((id) => id !== partId))
      } else {
        onPartsChange([...selectedPartIds, partId])
      }
    },
    [selectedPartIds, onPartsChange]
  )

  const getProjectState = useCallback(
    (project: ProjectTreeItem): "checked" | "unchecked" | "indeterminate" => {
      const projectPartIds = project.parts.map((p) => p.id)
      const checkedCount = projectPartIds.filter((id) =>
        selectedPartIds.includes(id)
      ).length

      if (checkedCount === 0) return "unchecked"
      if (checkedCount === projectPartIds.length) return "checked"
      return "indeterminate"
    },
    [selectedPartIds]
  )

  const indentClass = isMobile ? "pl-3" : "pl-4"

  return (
    <div className="flex flex-col gap-4">
      {/* Admin info alert */}
      {isAdmin && (
        <div className="flex items-start gap-2 rounded-lg border border-blue-200 bg-blue-50 p-3">
          <AlertCircle className="mt-0.5 size-4 shrink-0 text-blue-600" />
          <p className="text-sm text-blue-800">
            admin 역할은 모든 파트에 접근 가능합니다.
          </p>
        </div>
      )}

      {/* Instruction */}
      <p className="text-sm text-text-secondary">
        사용자가 접근할 수 있는 파트를 선택합니다.
      </p>

      {/* All access checkbox */}
      <label
        className={cn(
          "flex min-h-[44px] cursor-pointer items-center gap-3 rounded-lg border border-border px-3 py-2.5",
          (allAccess || isAdmin) && "border-brand-green/30 bg-brand-green/5"
        )}
      >
        <Checkbox
          checked={allAccess || isAdmin}
          onCheckedChange={(checked) => onAllAccessChange(checked === true)}
          disabled={isAdmin}
          aria-label="모든 파트에 접근 허용"
        />
        <span className="text-sm font-medium text-foreground">
          모든 파트에 접근 허용
        </span>
      </label>

      {/* Project-Part tree */}
      <div className="flex flex-col gap-3">
        {projectTree.map((project) => {
          const projectState = getProjectState(project)
          const isDisabled = allAccess || isAdmin

          return (
            <div key={project.id} className="flex flex-col gap-1">
              {/* Project row */}
              <label
                className={cn(
                  "flex min-h-[40px] cursor-pointer items-center gap-3 rounded-md px-2 py-1.5 transition-colors hover:bg-accent",
                  isDisabled && "cursor-not-allowed opacity-50"
                )}
              >
                <div className="relative flex items-center justify-center">
                  <Checkbox
                    checked={isDisabled ? true : projectState === "checked"}
                    onCheckedChange={() => handleProjectToggle(project)}
                    disabled={isDisabled}
                    className={cn(
                      projectState === "indeterminate" &&
                        !isDisabled &&
                        "border-primary bg-primary text-primary-foreground"
                    )}
                    aria-label={`${project.name} 전체 선택`}
                  />
                  {projectState === "indeterminate" && !isDisabled && (
                    <Minus className="pointer-events-none absolute size-3 text-primary-foreground" />
                  )}
                </div>
                <span className="text-sm font-semibold text-foreground">
                  {project.name}
                </span>
              </label>

              {/* Part rows */}
              <div className={cn("flex flex-col gap-0.5", indentClass)}>
                {project.parts.map((part) => {
                  const isChecked = isDisabled || selectedPartIds.includes(part.id)

                  return (
                    <label
                      key={part.id}
                      className={cn(
                        "flex min-h-[36px] cursor-pointer items-center gap-3 rounded-md px-2 py-1 transition-colors hover:bg-accent",
                        isDisabled && "cursor-not-allowed opacity-50"
                      )}
                    >
                      <Checkbox
                        checked={isChecked}
                        onCheckedChange={() => handlePartToggle(part.id)}
                        disabled={isDisabled}
                        aria-label={part.name}
                      />
                      <span className="text-sm text-foreground">
                        {part.name}
                      </span>
                    </label>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
