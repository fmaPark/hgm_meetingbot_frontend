import { FileX, FolderX, FolderOpen, Users, Settings, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"

interface EmptyStateAction {
  label: string
  onClick: () => void
  variant?: "default" | "outline"
}

interface EmptyStateProps {
  icon?: React.ReactNode
  title: string
  description?: string
  action?: EmptyStateAction
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex min-h-[300px] flex-col items-center justify-center p-8 text-center">
      {icon && (
        <div className="text-muted-foreground/60">
          {icon}
        </div>
      )}
      <h3 className="mt-4 text-lg font-semibold text-foreground">
        {title}
      </h3>
      {description && (
        <p className="mt-2 text-sm text-text-secondary">
          {description}
        </p>
      )}
      {action && (
        <Button
          variant={action.variant ?? "default"}
          onClick={action.onClick}
          className="mt-6"
        >
          {action.label}
        </Button>
      )}
    </div>
  )
}

/* ─── Preset Variants ──────────────────────────────────────── */

/** No meetings exist yet */
export function EmptyMeetings() {
  return (
    <EmptyState
      icon={<FileX className="size-12" />}
      title="회의 기록이 없습니다"
    />
  )
}

/** Search/filter returned no results */
export function EmptyFilteredResults({ onReset }: { onReset: () => void }) {
  return (
    <EmptyState
      icon={<FileX className="size-12" />}
      title="조건에 맞는 회의가 없습니다"
      action={{ label: "필터 초기화", onClick: onReset, variant: "outline" }}
    />
  )
}

/** Trash is empty */
export function EmptyTrash() {
  return (
    <EmptyState
      icon={<Trash2 className="size-12" />}
      title="삭제된 회의가 없습니다"
    />
  )
}

/** No projects exist */
export function EmptyProjects({ onAdd }: { onAdd: () => void }) {
  return (
    <EmptyState
      icon={<FolderX className="size-12" />}
      title="등록된 프로젝트가 없습니다"
      action={{ label: "+ 프로젝트 추가", onClick: onAdd }}
    />
  )
}

/** No users registered */
export function EmptyUsers() {
  return (
    <EmptyState
      icon={<Users className="size-12" />}
      title="등록된 사용자가 없습니다"
    />
  )
}

/** No parts registered */
export function EmptyParts({ onAdd }: { onAdd: () => void }) {
  return (
    <EmptyState
      icon={<FolderOpen className="size-12" />}
      title="등록된 파트가 없습니다"
      action={{ label: "+ 파트 추가", onClick: onAdd }}
    />
  )
}

/** Prompt to select a project */
export function SelectProjectPrompt() {
  return (
    <EmptyState
      icon={<FolderOpen className="size-12" />}
      title="프로젝트를 선택하세요"
      description="좌측에서 프로젝트를 선택하면 파트 목록이 표시됩니다."
    />
  )
}
