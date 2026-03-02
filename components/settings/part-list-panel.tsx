"use client"

import {
  Plus,
  MoreVertical,
  Pencil,
  Trash2,
  Settings,
  ArrowLeft,
  FolderOpen,
  Link,
  CheckCircle,
  XCircle,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { EmptyState } from "@/components/empty-state"
import type { Part, Project } from "@/lib/settings-types"
import { maskDriveId } from "@/lib/settings-types"

interface PartListPanelProps {
  project: Project | null
  parts: Part[]
  onBack?: () => void
  onAddPart: () => void
  onEditPart: (part: Part) => void
  onDeletePart: (part: Part) => void
  onAsanaSettings: (part: Part) => void
  loading?: boolean
  isMobile?: boolean
}

export function PartListPanel({
  project,
  parts,
  onBack,
  onAddPart,
  onEditPart,
  onDeletePart,
  onAsanaSettings,
  loading = false,
  isMobile = false,
}: PartListPanelProps) {
  // No project selected (desktop only)
  if (!project && !isMobile) {
    return (
      <div className="flex h-full items-center justify-center">
        <EmptyState
          icon={<FolderOpen className="size-12" />}
          title="프로젝트를 선택하세요"
          description="좌측에서 프로젝트를 선택하면 파트 목록이 표시됩니다."
        />
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex flex-col">
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          {isMobile && <Skeleton className="h-8 w-16" />}
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-8 w-24" />
        </div>
        <div className="flex flex-col gap-3 p-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-24 w-full rounded-lg" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <div className="flex items-center gap-2">
          {isMobile && onBack && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onBack}
              className="size-8"
              aria-label="뒤로가기"
            >
              <ArrowLeft className="size-4" />
            </Button>
          )}
          <h2 className="text-base font-semibold text-foreground">
            {project?.name}의 파트
          </h2>
        </div>
        <Button size="sm" onClick={onAddPart} className="gap-1">
          <Plus className="size-4" />
          파트 추가
        </Button>
      </div>

      {/* Part Cards */}
      <div className="flex-1 overflow-y-auto">
        {parts.length === 0 ? (
          <EmptyState
            icon={<FolderOpen className="size-12" />}
            title="등록된 파트가 없습니다"
            action={{ label: "+ 파트 추가", onClick: onAddPart }}
          />
        ) : (
          <div className="flex flex-col gap-3 p-4">
            {parts.map((part) => (
              <PartCard
                key={part.id}
                part={part}
                onEdit={() => onEditPart(part)}
                onDelete={() => onDeletePart(part)}
                onAsana={() => onAsanaSettings(part)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

/* ─── Part Card ──────────────────────────────────────── */

interface PartCardProps {
  part: Part
  onEdit: () => void
  onDelete: () => void
  onAsana: () => void
}

function PartCard({ part, onEdit, onDelete, onAsana }: PartCardProps) {
  return (
    <div className="group relative rounded-lg border border-border bg-card p-4">
      <div className="flex items-start justify-between gap-2">
        {/* Left info */}
        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <span className="text-sm font-semibold text-foreground">
            {part.name}
          </span>

          {/* Google Drive info */}
          <div className="flex items-center gap-2 text-xs">
            <Link className="size-3.5 shrink-0 text-text-secondary" />
            <span className="truncate text-text-secondary">
              {part.driveId ? maskDriveId(part.driveId) : "미설정"}
            </span>
            <Badge
              variant="secondary"
              className={cn(
                "shrink-0 gap-1 text-[11px]",
                part.driveConnected
                  ? "bg-green-100 text-green-800"
                  : "bg-secondary text-text-secondary"
              )}
            >
              {part.driveConnected ? (
                <CheckCircle className="size-3" />
              ) : (
                <XCircle className="size-3" />
              )}
              {part.driveConnected ? "연동됨" : "미연동"}
            </Badge>
          </div>

          {/* Asana info */}
          <div className="flex items-center gap-2 text-xs">
            <Settings className="size-3.5 shrink-0 text-text-secondary" />
            <span className="truncate text-text-secondary">
              {part.asanaConfigured && part.asanaConfig
                ? `${part.asanaConfig.projectName ?? ""} / ${part.asanaConfig.sectionName ?? ""}`
                : "미설정"}
            </span>
            <Badge
              variant="secondary"
              className={cn(
                "shrink-0 gap-1 text-[11px]",
                part.asanaConfigured
                  ? "bg-green-100 text-green-800"
                  : "bg-secondary text-text-secondary"
              )}
            >
              {part.asanaConfigured ? (
                <CheckCircle className="size-3" />
              ) : (
                <XCircle className="size-3" />
              )}
              {part.asanaConfigured ? "설정됨" : "미설정"}
            </Badge>
          </div>
        </div>

        {/* Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="size-8 shrink-0 opacity-0 group-hover:opacity-100 data-[state=open]:opacity-100"
            >
              <MoreVertical className="size-4 text-text-secondary" />
              <span className="sr-only">파트 메뉴</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="min-w-[140px]">
            <DropdownMenuItem onClick={onEdit} className="cursor-pointer gap-2">
              <Pencil className="size-4" />
              편집
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={onAsana}
              className="cursor-pointer gap-2"
            >
              <Settings className="size-4" />
              Asana 설정
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={onDelete}
              className="cursor-pointer gap-2 text-destructive focus:text-destructive"
            >
              <Trash2 className="size-4" />
              삭제
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}
