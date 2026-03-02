"use client"

import { useState, useCallback, useRef } from "react"
import { Plus, X, Settings } from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ConfirmDialog } from "@/components/confirm-dialog"
import { EmptyState } from "@/components/empty-state"
import type {
  Prompt,
  PromptItem,
  PromptItemType,
} from "@/lib/prompt-keyword-types"
import {
  PROMPT_TYPE_LABELS,
  PROMPT_TYPE_DESCRIPTIONS,
} from "@/lib/prompt-keyword-types"

interface PromptManagementPanelProps {
  prompts: Prompt[]
  onPromptsChange: (prompts: Prompt[]) => void
  loading?: boolean
}

export function PromptManagementPanel({
  prompts,
  onPromptsChange,
  loading = false,
}: PromptManagementPanelProps) {
  const [selectedId, setSelectedId] = useState<number | null>(null)

  // Editing state (local copy)
  const [editName, setEditName] = useState("")
  const [editIsGlobal, setEditIsGlobal] = useState(false)
  const [editItems, setEditItems] = useState<PromptItem[]>([])
  const [isDirty, setIsDirty] = useState(false)

  // Delete dialog
  const [deleteTarget, setDeleteTarget] = useState<Prompt | null>(null)
  const [deleteLoading, setDeleteLoading] = useState(false)

  // Unsaved changes dialog
  const [pendingSelectId, setPendingSelectId] = useState<number | null>(null)
  const [unsavedDialogOpen, setUnsavedDialogOpen] = useState(false)

  const nextItemId = useRef(1000)

  // Sorted: isGlobal first, then by createdAt ascending
  const sortedPrompts = [...prompts].sort((a, b) => {
    if (a.isGlobal !== b.isGlobal) return a.isGlobal ? -1 : 1
    return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  })

  const selectedPrompt = prompts.find((p) => p.id === selectedId) ?? null

  // Load a prompt into editing state
  const loadPrompt = useCallback((prompt: Prompt) => {
    setSelectedId(prompt.id)
    setEditName(prompt.name)
    setEditIsGlobal(prompt.isGlobal)
    setEditItems(prompt.items.map((item) => ({ ...item })))
    setIsDirty(false)
  }, [])

  const handleSelect = useCallback(
    (id: number) => {
      if (id === selectedId) return
      if (isDirty) {
        setPendingSelectId(id)
        setUnsavedDialogOpen(true)
        return
      }
      const prompt = prompts.find((p) => p.id === id)
      if (prompt) loadPrompt(prompt)
    },
    [selectedId, isDirty, prompts, loadPrompt]
  )

  const handleUnsavedDiscard = useCallback(() => {
    setUnsavedDialogOpen(false)
    if (pendingSelectId !== null) {
      const prompt = prompts.find((p) => p.id === pendingSelectId)
      if (prompt) loadPrompt(prompt)
    }
    setPendingSelectId(null)
  }, [pendingSelectId, prompts, loadPrompt])

  const handleAdd = useCallback(() => {
    if (isDirty) {
      setPendingSelectId(-1) // special marker for "add new"
      setUnsavedDialogOpen(true)
      return
    }
    doAdd()

    function doAdd() {
      const id = Date.now()
      const newPrompt: Prompt = {
        id,
        name: "",
        isGlobal: false,
        createdAt: new Date().toISOString(),
        items: [{ id: nextItemId.current++, type: "system", content: "" }],
      }
      onPromptsChange([...prompts, newPrompt])
      loadPrompt(newPrompt)
      setIsDirty(true)
    }
  }, [isDirty, prompts, onPromptsChange, loadPrompt])

  // For unsaved discard when pendingSelectId === -1 (add new)
  const handleUnsavedDiscardForAdd = useCallback(() => {
    setUnsavedDialogOpen(false)
    setPendingSelectId(null)
    const id = Date.now()
    const newPrompt: Prompt = {
      id,
      name: "",
      isGlobal: false,
      createdAt: new Date().toISOString(),
      items: [{ id: nextItemId.current++, type: "system", content: "" }],
    }
    onPromptsChange([...prompts, newPrompt])
    loadPrompt(newPrompt)
    setIsDirty(true)
  }, [prompts, onPromptsChange, loadPrompt])

  const handleSave = useCallback(() => {
    if (!editName.trim()) {
      toast.error("프롬프트명을 입력해주세요.")
      return
    }
    const updated = prompts.map((p) =>
      p.id === selectedId
        ? { ...p, name: editName.trim(), isGlobal: editIsGlobal, items: editItems }
        : p
    )
    onPromptsChange(updated)
    setIsDirty(false)
    toast.success("저장 완료")
  }, [prompts, selectedId, editName, editIsGlobal, editItems, onPromptsChange])

  const handleCancel = useCallback(() => {
    if (selectedPrompt) {
      loadPrompt(selectedPrompt)
    }
  }, [selectedPrompt, loadPrompt])

  const handleDeleteRequest = useCallback(() => {
    if (selectedPrompt) setDeleteTarget(selectedPrompt)
  }, [selectedPrompt])

  const handleDeleteConfirm = useCallback(() => {
    if (!deleteTarget) return
    setDeleteLoading(true)
    setTimeout(() => {
      const updated = prompts.filter((p) => p.id !== deleteTarget.id)
      onPromptsChange(updated)
      if (selectedId === deleteTarget.id) {
        setSelectedId(null)
        setIsDirty(false)
      }
      setDeleteTarget(null)
      setDeleteLoading(false)
      toast.success("삭제 완료")
    }, 400)
  }, [deleteTarget, prompts, selectedId, onPromptsChange])

  // Prompt item handlers
  const handleAddItem = useCallback(() => {
    setEditItems((prev) => [
      ...prev,
      { id: nextItemId.current++, type: "system", content: "" },
    ])
    setIsDirty(true)
  }, [])

  const handleRemoveItem = useCallback(
    (itemId: number) => {
      if (editItems.length <= 1) return
      setEditItems((prev) => prev.filter((item) => item.id !== itemId))
      setIsDirty(true)
    },
    [editItems.length]
  )

  const handleItemTypeChange = useCallback(
    (itemId: number, type: PromptItemType) => {
      setEditItems((prev) =>
        prev.map((item) => (item.id === itemId ? { ...item, type } : item))
      )
      setIsDirty(true)
    },
    []
  )

  const handleItemContentChange = useCallback(
    (itemId: number, content: string) => {
      setEditItems((prev) =>
        prev.map((item) => (item.id === itemId ? { ...item, content } : item))
      )
      setIsDirty(true)
    },
    []
  )

  // ─── Loading skeleton ───────────────────────────
  if (loading) {
    return (
      <div className="p-4">
        <div className="mb-4 flex items-center justify-between">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-8 w-24" />
        </div>
        <div className="flex flex-col gap-2">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-12 w-full rounded-lg" />
          ))}
        </div>
      </div>
    )
  }

  // ─── Empty state ───────────────────────────
  if (prompts.length === 0) {
    return (
      <div className="flex flex-col">
        <div className="flex items-center justify-between border-b border-border p-4">
          <h2 className="text-base font-semibold text-foreground">프롬프트 관리</h2>
          <Button size="sm" onClick={handleAdd} className="gap-1">
            <Plus className="size-4" />
            새 프롬프트
          </Button>
        </div>
        <EmptyState
          icon={<Settings className="size-12" />}
          title="등록된 프롬프트가 없습니다"
          action={{ label: "+ 새 프롬프트", onClick: handleAdd }}
        />
      </div>
    )
  }

  return (
    <div className="flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border p-4">
        <h2 className="text-base font-semibold text-foreground">프롬프트 관리</h2>
        <Button size="sm" onClick={handleAdd} className="gap-1">
          <Plus className="size-4" />
          새 프롬프트
        </Button>
      </div>

      {/* Prompt List */}
      <div className="flex flex-col gap-1 p-4">
        {sortedPrompts.map((prompt) => {
          const isSelected = prompt.id === selectedId
          return (
            <button
              key={prompt.id}
              onClick={() => handleSelect(prompt.id)}
              className={cn(
                "flex min-h-[44px] items-center gap-2 rounded-lg px-3 py-2 text-left text-sm transition-colors",
                isSelected
                  ? "border-l-4 border-l-brand-green bg-gray-100 font-semibold text-foreground"
                  : "border-l-4 border-l-transparent text-text-secondary hover:bg-accent"
              )}
            >
              <span className="flex-1 truncate">{prompt.name || "새 프롬프트"}</span>
              {prompt.isGlobal && (
                <Badge
                  variant="secondary"
                  className="shrink-0 bg-blue-100 text-blue-800"
                >
                  기본
                </Badge>
              )}
            </button>
          )
        })}
      </div>

      {/* Edit Area */}
      {selectedId !== null ? (
        <>
          <Separator />
          <div className="flex flex-col gap-4 p-4">
            {/* Name input */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-foreground">
                프롬프트명
              </label>
              <Input
                value={editName}
                onChange={(e) => {
                  setEditName(e.target.value)
                  setIsDirty(true)
                }}
                placeholder="프롬프트 이름을 입력하세요"
              />
            </div>

            {/* Global checkbox */}
            <div className="flex items-center gap-2">
              <Checkbox
                id="prompt-global"
                checked={editIsGlobal}
                onCheckedChange={(checked) => {
                  setEditIsGlobal(checked === true)
                  setIsDirty(true)
                }}
              />
              <label
                htmlFor="prompt-global"
                className="text-sm text-foreground"
              >
                모든 사용자에게 기본 노출
              </label>
            </div>

            {/* Prompt Items */}
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-foreground">
                  프롬프트 항목
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleAddItem}
                  className="gap-1 text-xs"
                >
                  <Plus className="size-3.5" />
                  항목 추가
                </Button>
              </div>

              {editItems.map((item) => (
                <div
                  key={item.id}
                  className="flex flex-col gap-2 rounded-lg border border-border p-3"
                >
                  <div className="flex items-center gap-2">
                    <Select
                      value={item.type}
                      onValueChange={(val) =>
                        handleItemTypeChange(item.id, val as PromptItemType)
                      }
                    >
                      <SelectTrigger className="w-[160px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {(
                          Object.keys(PROMPT_TYPE_LABELS) as PromptItemType[]
                        ).map((type) => (
                          <SelectItem key={type} value={type}>
                            <span>{PROMPT_TYPE_LABELS[type]}</span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <span className="flex-1 text-xs text-muted-foreground">
                      {PROMPT_TYPE_DESCRIPTIONS[item.type]}
                    </span>
                    {editItems.length > 1 && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-7 shrink-0 text-muted-foreground hover:text-destructive"
                        onClick={() => handleRemoveItem(item.id)}
                        aria-label="항목 삭제"
                      >
                        <X className="size-4" />
                      </Button>
                    )}
                  </div>
                  <Textarea
                    value={item.content}
                    onChange={(e) =>
                      handleItemContentChange(item.id, e.target.value)
                    }
                    placeholder="프롬프트 내용을 입력하세요"
                    className="min-h-[100px] resize-y"
                  />
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between pt-2">
              <Button
                variant="destructive"
                size="sm"
                onClick={handleDeleteRequest}
              >
                삭제
              </Button>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={handleCancel}>
                  취소
                </Button>
                <Button size="sm" onClick={handleSave}>
                  저장
                </Button>
              </div>
            </div>
          </div>
        </>
      ) : (
        <>
          <Separator />
          <div className="flex min-h-[200px] items-center justify-center p-8 text-center">
            <p className="text-sm text-muted-foreground">
              프롬프트를 선택하세요
            </p>
          </div>
        </>
      )}

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null)
        }}
        title="프롬프트 삭제"
        description={`${deleteTarget?.name || "프롬프트"}을(를) 삭제하시겠습니까?`}
        confirmText="삭제"
        cancelText="취소"
        variant="destructive"
        loading={deleteLoading}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
      />

      {/* Unsaved Changes Dialog */}
      <ConfirmDialog
        open={unsavedDialogOpen}
        onOpenChange={(open) => {
          if (!open) {
            setUnsavedDialogOpen(false)
            setPendingSelectId(null)
          }
        }}
        title="변경사항 저장"
        description="저장하지 않은 변경사항이 있습니다. 저장하지 않고 이동하시겠습니까?"
        confirmText="저장하지 않고 이동"
        cancelText="취소"
        variant="default"
        onConfirm={
          pendingSelectId === -1
            ? handleUnsavedDiscardForAdd
            : handleUnsavedDiscard
        }
        onCancel={() => {
          setUnsavedDialogOpen(false)
          setPendingSelectId(null)
        }}
      />
    </div>
  )
}
