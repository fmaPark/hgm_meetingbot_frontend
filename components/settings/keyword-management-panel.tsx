"use client"

import { useState, useCallback, useRef, type KeyboardEvent } from "react"
import { Plus, X, Settings } from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { ConfirmDialog } from "@/components/confirm-dialog"
import { EmptyState } from "@/components/empty-state"
import {
  useKeywords,
  useCreateKeyword,
  useUpdateKeyword,
  useDeleteKeyword,
} from "@/lib/hooks/use-prompts"
import { KEYWORD_MAX } from "@/lib/prompt-keyword-types"

export function KeywordManagementPanel() {
  const { data: keywordsData = [], isLoading: loading } = useKeywords()
  const createMutation = useCreateKeyword()
  const updateMutation = useUpdateKeyword()
  const deleteMutation = useDeleteKeyword()

  const [selectedId, setSelectedId] = useState<number | null>(null)

  // Editing state
  const [editName, setEditName] = useState("")
  const [editIsGlobal, setEditIsGlobal] = useState(false)
  const [editKeywords, setEditKeywords] = useState<string[]>([])
  const [keywordInput, setKeywordInput] = useState("")
  const [isDirty, setIsDirty] = useState(false)
  const [isNew, setIsNew] = useState(false)

  // Delete dialog
  const [deleteTargetId, setDeleteTargetId] = useState<number | null>(null)

  // Unsaved changes dialog
  const [pendingSelectId, setPendingSelectId] = useState<number | null>(null)
  const [unsavedDialogOpen, setUnsavedDialogOpen] = useState(false)

  const inputRef = useRef<HTMLInputElement>(null)

  // Sorted: isGlobal first, then by id ascending
  const sortedSets = [...keywordsData].sort((a, b) => {
    if (a.is_global !== b.is_global) return a.is_global ? -1 : 1
    return a.id - b.id
  })

  // Map API keywords (Record<string, string>) to string[] for editing
  function apiKeywordsToList(kw: Record<string, string>): string[] {
    return Object.keys(kw)
  }

  // Map string[] back to Record<string, string> for API
  function listToApiKeywords(list: string[]): Record<string, string> {
    const result: Record<string, string> = {}
    for (const k of list) {
      result[k] = k
    }
    return result
  }

  const loadSet = useCallback(
    (id: number) => {
      const set = keywordsData.find((s) => s.id === id)
      if (!set) return
      setSelectedId(set.id)
      setEditName(set.name)
      setEditIsGlobal(set.is_global)
      setEditKeywords(apiKeywordsToList(set.keywords))
      setKeywordInput("")
      setIsDirty(false)
      setIsNew(false)
    },
    [keywordsData]
  )

  const handleSelect = useCallback(
    (id: number) => {
      if (id === selectedId) return
      if (isDirty) {
        setPendingSelectId(id)
        setUnsavedDialogOpen(true)
        return
      }
      loadSet(id)
    },
    [selectedId, isDirty, loadSet]
  )

  const handleUnsavedDiscard = useCallback(() => {
    setUnsavedDialogOpen(false)
    if (pendingSelectId !== null && pendingSelectId !== -1) {
      loadSet(pendingSelectId)
    }
    setPendingSelectId(null)
  }, [pendingSelectId, loadSet])

  const doStartNew = useCallback(() => {
    setSelectedId(null)
    setEditName("")
    setEditIsGlobal(false)
    setEditKeywords([])
    setKeywordInput("")
    setIsDirty(true)
    setIsNew(true)
  }, [])

  const handleUnsavedDiscardForAdd = useCallback(() => {
    setUnsavedDialogOpen(false)
    setPendingSelectId(null)
    doStartNew()
  }, [doStartNew])

  const handleAdd = useCallback(() => {
    if (isDirty) {
      setPendingSelectId(-1)
      setUnsavedDialogOpen(true)
      return
    }
    doStartNew()
  }, [isDirty, doStartNew])

  const handleSave = useCallback(() => {
    if (!editName.trim()) {
      toast.error("세트명을 입력해주세요.")
      return
    }

    const payload = {
      name: editName.trim(),
      is_global: editIsGlobal,
      keywords: listToApiKeywords(editKeywords),
    }

    if (isNew) {
      createMutation.mutate(payload, {
        onSuccess: (created) => {
          setIsDirty(false)
          setIsNew(false)
          setSelectedId(created.id)
          toast.success("키워드 세트 생성 완료")
        },
        onError: () => toast.error("키워드 세트 생성 실패"),
      })
    } else if (selectedId !== null) {
      updateMutation.mutate(
        { keywordId: selectedId, data: payload },
        {
          onSuccess: () => {
            setIsDirty(false)
            toast.success("저장 완료")
          },
          onError: () => toast.error("저장 실패"),
        }
      )
    }
  }, [editName, editIsGlobal, editKeywords, isNew, selectedId, createMutation, updateMutation])

  const handleCancel = useCallback(() => {
    if (isNew) {
      setSelectedId(null)
      setIsDirty(false)
      setIsNew(false)
      return
    }
    if (selectedId !== null) {
      loadSet(selectedId)
    }
  }, [isNew, selectedId, loadSet])

  const handleDeleteRequest = useCallback(() => {
    if (selectedId !== null) setDeleteTargetId(selectedId)
  }, [selectedId])

  const handleDeleteConfirm = useCallback(() => {
    if (deleteTargetId === null) return
    deleteMutation.mutate(deleteTargetId, {
      onSuccess: () => {
        if (selectedId === deleteTargetId) {
          setSelectedId(null)
          setIsDirty(false)
          setIsNew(false)
        }
        setDeleteTargetId(null)
        toast.success("삭제 완료")
      },
      onError: () => toast.error("삭제 실패"),
    })
  }, [deleteTargetId, selectedId, deleteMutation])

  // ─── Keyword chip handlers ───────────────────────

  const removeKeyword = useCallback((keyword: string) => {
    setEditKeywords((prev) => prev.filter((k) => k !== keyword))
    setIsDirty(true)
  }, [])

  const handleKeywordKeyDown = useCallback(
    (e: KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter" || e.key === ",") {
        e.preventDefault()
        const parts = keywordInput.split(",")
        const newKeywords = [...editKeywords]
        for (const part of parts) {
          const trimmed = part.trim()
          if (trimmed && !newKeywords.includes(trimmed) && newKeywords.length < KEYWORD_MAX) {
            newKeywords.push(trimmed)
          }
        }
        setEditKeywords(newKeywords)
        setKeywordInput("")
        setIsDirty(true)
      } else if (e.key === "Backspace" && keywordInput === "" && editKeywords.length > 0) {
        setEditKeywords((prev) => prev.slice(0, -1))
        setIsDirty(true)
      }
    },
    [keywordInput, editKeywords]
  )

  const isAtMax = editKeywords.length >= KEYWORD_MAX
  const showEditor = selectedId !== null || isNew

  const deleteTargetName = deleteTargetId !== null
    ? keywordsData.find((s) => s.id === deleteTargetId)?.name ?? "키워드 세트"
    : "키워드 세트"

  // ─── Loading skeleton ───────────────────────────
  if (loading) {
    return (
      <div className="p-4">
        <div className="mb-4 flex items-center justify-between">
          <Skeleton className="h-6 w-36" />
          <Skeleton className="h-8 w-28" />
        </div>
        <div className="flex flex-col gap-2">
          {[1, 2].map((i) => (
            <Skeleton key={i} className="h-12 w-full rounded-lg" />
          ))}
        </div>
      </div>
    )
  }

  // ─── Empty state ───────────────────────────
  if (keywordsData.length === 0 && !isNew) {
    return (
      <div className="flex flex-col">
        <div className="flex items-center justify-between border-b border-border p-4">
          <h2 className="text-base font-semibold text-foreground">
            키워드 세트 관리
          </h2>
          <Button size="sm" onClick={handleAdd} className="gap-1">
            <Plus className="size-4" />
            새 키워드 세트
          </Button>
        </div>
        <EmptyState
          icon={<Settings className="size-12" />}
          title="등록된 키워드 세트가 없습니다"
          action={{ label: "+ 새 키워드 세트", onClick: handleAdd }}
        />
      </div>
    )
  }

  return (
    <div className="flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border p-4">
        <h2 className="text-base font-semibold text-foreground">
          키워드 세트 관리
        </h2>
        <Button size="sm" onClick={handleAdd} className="gap-1">
          <Plus className="size-4" />
          새 키워드 세트
        </Button>
      </div>

      {/* Set List */}
      <div className="flex flex-col gap-1 p-4">
        {sortedSets.map((set) => {
          const isSelected = set.id === selectedId
          return (
            <button
              key={set.id}
              onClick={() => handleSelect(set.id)}
              className={cn(
                "flex min-h-[44px] items-center gap-2 rounded-lg px-3 py-2 text-left text-sm transition-colors",
                isSelected
                  ? "border-l-4 border-l-brand-green bg-gray-100 font-semibold text-foreground"
                  : "border-l-4 border-l-transparent text-text-secondary hover:bg-accent"
              )}
            >
              <span className="flex-1 truncate">{set.name || "새 키워드 세트"}</span>
              <div className="flex shrink-0 items-center gap-1.5">
                {set.is_global && (
                  <Badge
                    variant="secondary"
                    className="bg-blue-100 text-blue-800"
                  >
                    기본
                  </Badge>
                )}
                <Badge variant="outline" className="text-xs">
                  {Object.keys(set.keywords).length}개
                </Badge>
              </div>
            </button>
          )
        })}
      </div>

      {/* Edit Area */}
      {showEditor ? (
        <>
          <Separator />
          <div className="flex flex-col gap-4 p-4">
            {/* Name input */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-foreground">
                세트명
              </label>
              <Input
                value={editName}
                onChange={(e) => {
                  setEditName(e.target.value)
                  setIsDirty(true)
                }}
                placeholder="키워드 세트 이름을 입력하세요"
              />
            </div>

            {/* Global checkbox */}
            <div className="flex items-center gap-2">
              <Checkbox
                id="keyword-global"
                checked={editIsGlobal}
                onCheckedChange={(checked) => {
                  setEditIsGlobal(checked === true)
                  setIsDirty(true)
                }}
              />
              <label
                htmlFor="keyword-global"
                className="text-sm text-foreground"
              >
                모든 사용자에게 기본 노출
              </label>
            </div>

            {/* Keywords */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-foreground">키워드</h3>
                <span
                  className={cn(
                    "text-xs",
                    isAtMax ? "font-medium text-destructive" : "text-muted-foreground"
                  )}
                >
                  ({editKeywords.length} / {KEYWORD_MAX})
                </span>
              </div>

              {/* Input */}
              <Input
                ref={inputRef}
                value={keywordInput}
                onChange={(e) => setKeywordInput(e.target.value)}
                onKeyDown={handleKeywordKeyDown}
                placeholder={
                  isAtMax
                    ? "최대 개수에 도달했습니다"
                    : "키워드를 입력하세요 (Enter 또는 쉼표로 추가)"
                }
                disabled={isAtMax}
              />

              {/* Chip List */}
              {editKeywords.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {editKeywords.map((keyword) => (
                    <span
                      key={keyword}
                      className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-1 text-sm text-foreground"
                    >
                      {keyword}
                      <button
                        onClick={() => removeKeyword(keyword)}
                        className="inline-flex size-4 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-gray-200 hover:text-foreground"
                        aria-label={`${keyword} 삭제`}
                      >
                        <X className="size-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between pt-2">
              {!isNew && (
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleDeleteRequest}
                >
                  삭제
                </Button>
              )}
              {isNew && <div />}
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={handleCancel}>
                  취소
                </Button>
                <Button
                  size="sm"
                  onClick={handleSave}
                  disabled={createMutation.isPending || updateMutation.isPending}
                >
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
              키워드 세트를 선택하세요
            </p>
          </div>
        </>
      )}

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={deleteTargetId !== null}
        onOpenChange={(open) => {
          if (!open) setDeleteTargetId(null)
        }}
        title="키워드 세트 삭제"
        description={`${deleteTargetName}을(를) 삭제하시겠습니까?`}
        confirmText="삭제"
        cancelText="취소"
        variant="destructive"
        loading={deleteMutation.isPending}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTargetId(null)}
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
