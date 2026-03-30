"use client"

import { useState, useRef, useEffect } from "react"
import {
  Plus,
  MoreVertical,
  Pencil,
  Trash2,
  ChevronRight,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { EmptyState } from "@/components/empty-state"
import { FolderX } from "lucide-react"
import type { Project } from "@/lib/settings-types"

interface ProjectListPanelProps {
  projects: Project[]
  selectedId: number | null
  onSelect: (project: Project) => void
  onAdd: (name: string) => void
  onRename: (id: number, name: string) => void
  onDelete: (project: Project) => void
  loading?: boolean
  isMobile?: boolean
}

export function ProjectListPanel({
  projects,
  selectedId,
  onSelect,
  onAdd,
  onRename,
  onDelete,
  loading = false,
  isMobile = false,
}: ProjectListPanelProps) {
  // Inline add/edit state
  const [addMode, setAddMode] = useState(false)
  const [editId, setEditId] = useState<number | null>(null)
  const [inputValue, setInputValue] = useState("")
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if ((addMode || editId !== null) && inputRef.current) {
      inputRef.current.focus()
    }
  }, [addMode, editId])

  function handleStartAdd() {
    setAddMode(true)
    setEditId(null)
    setInputValue("")
  }

  function handleStartRename(project: Project) {
    setEditId(project.id)
    setAddMode(false)
    setInputValue(project.name)
  }

  function handleSaveAdd() {
    const trimmed = inputValue.trim()
    if (!trimmed) return
    onAdd(trimmed)
    setAddMode(false)
    setInputValue("")
  }

  function handleSaveRename() {
    const trimmed = inputValue.trim()
    if (!trimmed || editId === null) return
    onRename(editId, trimmed)
    setEditId(null)
    setInputValue("")
  }

  function handleCancelInline() {
    setAddMode(false)
    setEditId(null)
    setInputValue("")
  }

  function handleKeyDown(
    e: React.KeyboardEvent,
    action: "add" | "rename"
  ) {
    if (e.key === "Enter") {
      e.preventDefault()
      if (action === "add") handleSaveAdd()
      else handleSaveRename()
    }
    if (e.key === "Escape") {
      e.preventDefault()
      handleCancelInline()
    }
  }

  // Loading skeleton
  if (loading) {
    return (
      <div className="flex flex-col">
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <Skeleton className="h-5 w-20" />
          <Skeleton className="h-8 w-28" />
        </div>
        <div className="flex flex-col gap-1 p-2">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-12 w-full rounded-lg" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <h2 className="text-base font-semibold text-foreground">
          {isMobile ? "프로젝트" : "프로젝트"}
        </h2>
        <Button size="sm" onClick={handleStartAdd} className="gap-1">
          <Plus className="size-4" />
          {isMobile ? "추가" : "프로젝트 추가"}
        </Button>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto">
        {/* Inline add row */}
        {addMode && (
          <div className="flex items-center gap-2 border-b border-border px-4 py-2.5">
            <Input
              ref={inputRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => handleKeyDown(e, "add")}
              placeholder="프로젝트명 입력"
              className="h-8 flex-1 text-sm"
            />
            <Button
              size="sm"
              variant="default"
              onClick={handleSaveAdd}
              disabled={!inputValue.trim()}
              className="h-8 px-3 text-xs"
            >
              저장
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={handleCancelInline}
              className="h-8 px-3 text-xs"
            >
              취소
            </Button>
          </div>
        )}

        {/* Empty state */}
        {projects.length === 0 && !addMode && (
          <EmptyState
            icon={<FolderX className="size-12" />}
            title="등록된 프로젝트가 없습니다"
            action={{ label: "+ 프로젝트 추가", onClick: handleStartAdd }}
          />
        )}

        {/* Project items */}
        {projects.map((project) => {
          const isSelected = project.id === selectedId
          const isEditing = editId === project.id

          if (isEditing) {
            return (
              <div
                key={project.id}
                className="flex items-center gap-2 border-b border-border px-4 py-2.5"
              >
                <Input
                  ref={inputRef}
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={(e) => handleKeyDown(e, "rename")}
                  placeholder="프로젝트명 입력"
                  className="h-8 flex-1 text-sm"
                />
                <Button
                  size="sm"
                  variant="default"
                  onClick={handleSaveRename}
                  disabled={!inputValue.trim()}
                  className="h-8 px-3 text-xs"
                >
                  저장
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleCancelInline}
                  className="h-8 px-3 text-xs"
                >
                  취소
                </Button>
              </div>
            )
          }

          return (
            <div
              key={project.id}
              role="button"
              tabIndex={0}
              onClick={() => onSelect(project)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault()
                  onSelect(project)
                }
              }}
              className={cn(
                "group flex min-h-[48px] cursor-pointer items-center justify-between border-b border-border px-4 py-3 transition-colors hover:bg-accent/60",
                isSelected && !isMobile && "border-l-4 border-l-brand-green bg-accent"
              )}
            >
              <div className="flex min-w-0 flex-1 items-center gap-2">
                <span
                  className={cn(
                    "truncate text-sm",
                    isSelected && !isMobile
                      ? "font-semibold text-foreground"
                      : "font-medium text-foreground"
                  )}
                >
                  {project.name}
                </span>
                <Badge
                  variant="secondary"
                  className="shrink-0 bg-secondary text-text-secondary text-xs"
                >
                  {project.parts.length}개 파트
                </Badge>
              </div>

              <div className="flex shrink-0 items-center gap-1">
                {/* Menu */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-8 opacity-0 group-hover:opacity-100 data-[state=open]:opacity-100"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <MoreVertical className="size-4 text-text-secondary" />
                      <span className="sr-only">프로젝트 메뉴</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="min-w-[140px]">
                    <DropdownMenuItem
                      onClick={(e) => {
                        e.stopPropagation()
                        handleStartRename(project)
                      }}
                      className="cursor-pointer gap-2"
                    >
                      <Pencil className="size-4" />
                      이름 변경
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={(e) => {
                        e.stopPropagation()
                        onDelete(project)
                      }}
                      className="cursor-pointer gap-2 text-destructive focus:text-destructive"
                    >
                      <Trash2 className="size-4" />
                      삭제
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* Mobile chevron */}
                {isMobile && (
                  <ChevronRight className="size-4 text-text-secondary" />
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
