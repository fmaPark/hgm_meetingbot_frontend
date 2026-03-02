"use client"

import { useState, useCallback, useMemo, useRef } from "react"
import {
  Plus,
  Pencil,
  Trash2,
  AlertTriangle,
  Loader2,
  Settings,
} from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { useIsMobile } from "@/hooks/use-mobile"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { ConfirmDialog } from "@/components/confirm-dialog"
import { EmptyState } from "@/components/empty-state"
import type { ApiKeyEntry, AvailableProvider } from "@/lib/apikey-types"
import {
  AVAILABLE_PROVIDERS,
  maskApiKey,
  isValidApiKey,
  getTodayString,
  getUnregisteredProviders,
} from "@/lib/apikey-types"

interface SystemSettingsPanelProps {
  apiKeys: ApiKeyEntry[]
  onApiKeysChange: (keys: ApiKeyEntry[]) => void
  loading?: boolean
}

/* ─── Skeleton ────────────────────────────────────────── */
function ApiKeySkeletonCards() {
  return (
    <div className="flex flex-col gap-3">
      {[1, 2].map((i) => (
        <div
          key={i}
          className="rounded-lg border border-border bg-card p-4"
        >
          <div className="flex items-center justify-between">
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-8 w-16" />
          </div>
          <Skeleton className="mt-3 h-4 w-64" />
          <div className="mt-3 flex items-center justify-between">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-8 w-16" />
          </div>
        </div>
      ))}
    </div>
  )
}

/* ─── Inline Add Form ─────────────────────────────────── */
function InlineAddForm({
  unregistered,
  onSave,
  onCancel,
}: {
  unregistered: AvailableProvider[]
  onSave: (providerId: string, key: string) => void
  onCancel: () => void
}) {
  const isMobile = useIsMobile()
  const [providerId, setProviderId] = useState(
    unregistered.length === 1 ? unregistered[0].id : ""
  )
  const [keyValue, setKeyValue] = useState("")
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleSave = useCallback(() => {
    if (!providerId) {
      toast.error("서비스를 선택해주세요.")
      return
    }
    if (!keyValue.trim()) {
      setError("API 키를 입력해주세요.")
      inputRef.current?.focus()
      return
    }
    if (!isValidApiKey(keyValue)) {
      toast.error("유효하지 않은 API 키입니다. 키를 확인해주세요.")
      inputRef.current?.focus()
      return
    }
    setError(null)
    setSaving(true)
    setTimeout(() => {
      onSave(providerId, keyValue)
      setSaving(false)
    }, 800)
  }, [providerId, keyValue, onSave])

  return (
    <div className="rounded-lg border-2 border-dashed border-brand-green/40 bg-card p-4">
      {!isMobile ? (
        /* Desktop: horizontal layout */
        <>
          <div className="flex items-center gap-3">
            <Select
              value={providerId}
              onValueChange={setProviderId}
              disabled={saving}
            >
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="서비스 선택" />
              </SelectTrigger>
              <SelectContent>
                {unregistered.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Input
              ref={inputRef}
              placeholder="API Key를 입력하세요"
              value={keyValue}
              onChange={(e) => {
                setKeyValue(e.target.value)
                if (error) setError(null)
              }}
              disabled={saving}
              className={cn("flex-1", error && "border-destructive")}
            />

            <Button
              variant="outline"
              onClick={onCancel}
              disabled={saving}
              className="shrink-0"
            >
              취소
            </Button>
            <Button
              onClick={handleSave}
              disabled={saving}
              className="min-w-[80px] shrink-0"
            >
              {saving ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  저장 중...
                </>
              ) : (
                "저장"
              )}
            </Button>
          </div>
          {error && (
            <p className="mt-2 text-xs text-destructive">{error}</p>
          )}
          <p className="mt-2 flex items-center gap-1.5 text-xs text-text-secondary">
            <AlertTriangle className="size-3.5 shrink-0 text-yellow-600" />
            API 키는 저장 후 마스킹되어 표시됩니다.
          </p>
        </>
      ) : (
        /* Mobile: vertical stack */
        <>
          <Select
            value={providerId}
            onValueChange={setProviderId}
            disabled={saving}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="서비스 선택" />
            </SelectTrigger>
            <SelectContent>
              {unregistered.map((p) => (
                <SelectItem key={p.id} value={p.id}>
                  {p.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Input
            ref={inputRef}
            placeholder="API Key를 입력하세요"
            value={keyValue}
            onChange={(e) => {
              setKeyValue(e.target.value)
              if (error) setError(null)
            }}
            disabled={saving}
            className={cn("mt-3 w-full", error && "border-destructive")}
          />
          {error && (
            <p className="mt-1.5 text-xs text-destructive">{error}</p>
          )}

          <p className="mt-2 flex items-center gap-1.5 text-xs text-text-secondary">
            <AlertTriangle className="size-3.5 shrink-0 text-yellow-600" />
            API 키는 저장 후 마스킹되어 표시됩니다.
          </p>

          <div className="mt-3 flex gap-2">
            <Button
              variant="outline"
              onClick={onCancel}
              disabled={saving}
              className="flex-1"
            >
              취소
            </Button>
            <Button
              onClick={handleSave}
              disabled={saving}
              className="min-w-[80px] flex-1"
            >
              {saving ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  저장 중...
                </>
              ) : (
                "저장"
              )}
            </Button>
          </div>
        </>
      )}
    </div>
  )
}

/* ─── Inline Edit Form ────────────────────────────────── */
function InlineEditForm({
  entry,
  onSave,
  onCancel,
}: {
  entry: ApiKeyEntry
  onSave: (key: string) => void
  onCancel: () => void
}) {
  const isMobile = useIsMobile()
  const [keyValue, setKeyValue] = useState("")
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleSave = useCallback(() => {
    if (!keyValue.trim()) {
      setError("API 키를 입력해주세요.")
      inputRef.current?.focus()
      return
    }
    if (!isValidApiKey(keyValue)) {
      toast.error("유효하지 않은 API 키입니다. 키를 확인해주세요.")
      inputRef.current?.focus()
      return
    }
    setError(null)
    setSaving(true)
    setTimeout(() => {
      onSave(keyValue)
      setSaving(false)
    }, 800)
  }, [keyValue, onSave])

  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <h3 className="text-sm font-semibold text-foreground">
        {entry.provider}
      </h3>

      {!isMobile ? (
        /* Desktop: horizontal layout */
        <>
          <div className="mt-3 flex items-center gap-3">
            <label className="shrink-0 text-sm text-text-secondary">
              새 API Key:
            </label>
            <Input
              ref={inputRef}
              placeholder="새 API Key를 입력하세요"
              value={keyValue}
              onChange={(e) => {
                setKeyValue(e.target.value)
                if (error) setError(null)
              }}
              disabled={saving}
              className={cn("flex-1", error && "border-destructive")}
            />
          </div>
          {error && (
            <p className="mt-1.5 pl-[86px] text-xs text-destructive">{error}</p>
          )}
          <div className="mt-3 flex items-center justify-between">
            <p className="flex items-center gap-1.5 text-xs text-text-secondary">
              <AlertTriangle className="size-3.5 shrink-0 text-yellow-600" />
              기존 키는 새 키로 대체됩니다.
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={onCancel}
                disabled={saving}
              >
                취소
              </Button>
              <Button
                size="sm"
                onClick={handleSave}
                disabled={saving}
                className="min-w-[80px]"
              >
                {saving ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    저장 중...
                  </>
                ) : (
                  "저장"
                )}
              </Button>
            </div>
          </div>
        </>
      ) : (
        /* Mobile: vertical stack */
        <>
          <label className="mt-3 block text-sm text-text-secondary">
            새 API Key:
          </label>
          <Input
            ref={inputRef}
            placeholder="새 API Key를 입력하세요"
            value={keyValue}
            onChange={(e) => {
              setKeyValue(e.target.value)
              if (error) setError(null)
            }}
            disabled={saving}
            className={cn("mt-1.5 w-full", error && "border-destructive")}
          />
          {error && (
            <p className="mt-1.5 text-xs text-destructive">{error}</p>
          )}
          <p className="mt-2 flex items-center gap-1.5 text-xs text-text-secondary">
            <AlertTriangle className="size-3.5 shrink-0 text-yellow-600" />
            기존 키는 새 키로 대체됩니다.
          </p>
          <div className="mt-3 flex gap-2">
            <Button
              variant="outline"
              onClick={onCancel}
              disabled={saving}
              className="flex-1"
            >
              취소
            </Button>
            <Button
              onClick={handleSave}
              disabled={saving}
              className="min-w-[80px] flex-1"
            >
              {saving ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  저장 중...
                </>
              ) : (
                "저장"
              )}
            </Button>
          </div>
        </>
      )}
    </div>
  )
}

/* ─── API Key Display Card ────────────────────────────── */
function ApiKeyCard({
  entry,
  onEdit,
  onDelete,
}: {
  entry: ApiKeyEntry
  onEdit: () => void
  onDelete: () => void
}) {
  const isMobile = useIsMobile()

  if (!isMobile) {
    /* Desktop card layout */
    return (
      <div className="rounded-lg border border-border bg-card p-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-foreground">
            {entry.provider}
          </h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={onDelete}
            className="gap-1.5 text-xs text-destructive hover:bg-destructive/10 hover:text-destructive"
          >
            <Trash2 className="size-3.5" />
            삭제
          </Button>
        </div>

        <p className="mt-2 font-mono text-sm text-text-secondary">
          API Key: {entry.maskedKey}
        </p>

        <div className="mt-2 flex items-center justify-between">
          <p className="text-xs text-muted-foreground">
            등록일: {entry.registeredAt}
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={onEdit}
            className="gap-1.5 text-xs"
          >
            <Pencil className="size-3.5" />
            변경
          </Button>
        </div>
      </div>
    )
  }

  /* Mobile card layout */
  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <h3 className="text-sm font-semibold text-foreground">
        {entry.provider}
      </h3>
      <p className="mt-2 break-all font-mono text-sm text-text-secondary">
        API Key: {entry.maskedKey}
      </p>
      <p className="mt-1.5 text-xs text-muted-foreground">
        등록일: {entry.registeredAt}
      </p>
      <div className="mt-3 flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={onEdit}
          className="flex-1 gap-1.5 text-xs"
        >
          <Pencil className="size-3.5" />
          변경
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={onDelete}
          className="flex-1 gap-1.5 text-xs text-destructive hover:bg-destructive/10 hover:text-destructive"
        >
          <Trash2 className="size-3.5" />
          삭제
        </Button>
      </div>
    </div>
  )
}

/* ─── Main Panel ──────────────────────────────────────── */
export function SystemSettingsPanel({
  apiKeys,
  onApiKeysChange,
  loading = false,
}: SystemSettingsPanelProps) {
  const nextId = useRef(
    apiKeys.length > 0 ? Math.max(...apiKeys.map((k) => k.id)) + 1 : 1
  )

  // Add form
  const [showAddForm, setShowAddForm] = useState(false)

  // Edit form
  const [editingId, setEditingId] = useState<number | null>(null)

  // Delete dialog
  const [deleteTarget, setDeleteTarget] = useState<ApiKeyEntry | null>(null)
  const [deleteLoading, setDeleteLoading] = useState(false)

  const registeredProviderIds = useMemo(
    () => apiKeys.map((k) => k.providerId),
    [apiKeys]
  )
  const unregisteredProviders = useMemo(
    () => getUnregisteredProviders(registeredProviderIds),
    [registeredProviderIds]
  )
  const allRegistered = unregisteredProviders.length === 0

  // Add key handler
  const handleAddSave = useCallback(
    (providerId: string, key: string) => {
      const provider = AVAILABLE_PROVIDERS.find((p) => p.id === providerId)
      if (!provider) return

      const newEntry: ApiKeyEntry = {
        id: nextId.current++,
        provider: provider.name,
        providerId: provider.id,
        maskedKey: maskApiKey(key),
        registeredAt: getTodayString(),
      }
      onApiKeysChange([...apiKeys, newEntry])
      setShowAddForm(false)
      toast.success("API 키 등록 완료")
    },
    [apiKeys, onApiKeysChange]
  )

  // Edit key handler
  const handleEditSave = useCallback(
    (entryId: number, newKey: string) => {
      onApiKeysChange(
        apiKeys.map((k) =>
          k.id === entryId
            ? { ...k, maskedKey: maskApiKey(newKey), registeredAt: getTodayString() }
            : k
        )
      )
      setEditingId(null)
      toast.success("API 키 변경 완료")
    },
    [apiKeys, onApiKeysChange]
  )

  // Delete key handler
  const handleDeleteConfirm = useCallback(() => {
    if (!deleteTarget) return
    setDeleteLoading(true)
    setTimeout(() => {
      onApiKeysChange(apiKeys.filter((k) => k.id !== deleteTarget.id))
      setDeleteTarget(null)
      setDeleteLoading(false)
      toast.success("삭제 완료")
    }, 500)
  }, [deleteTarget, apiKeys, onApiKeysChange])

  const handleAddClick = useCallback(() => {
    setEditingId(null)
    setShowAddForm(true)
  }, [])

  return (
    <div className="px-4 py-6">
      <Card className="border-border shadow-none">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg font-semibold text-foreground">
                LLM API 키 설정
              </CardTitle>
              <CardDescription className="mt-1 text-sm text-text-secondary">
                AI 요약 기능에 사용되는 외부 LLM 서비스의 API 키를 관리합니다.
              </CardDescription>
            </div>

            {/* Add Key Button */}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="inline-flex">
                    <Button
                      variant="default"
                      size="sm"
                      onClick={handleAddClick}
                      disabled={allRegistered || showAddForm}
                      className="gap-1.5 text-xs"
                    >
                      <Plus className="size-4" />
                      <span className="hidden sm:inline">API 키 추가</span>
                      <span className="sm:hidden">추가</span>
                    </Button>
                  </span>
                </TooltipTrigger>
                {allRegistered && (
                  <TooltipContent>
                    <p>모든 서비스의 키가 등록되어 있습니다</p>
                  </TooltipContent>
                )}
              </Tooltip>
            </TooltipProvider>
          </div>
        </CardHeader>

        <CardContent className="flex flex-col gap-3">
          {/* Loading state */}
          {loading ? (
            <ApiKeySkeletonCards />
          ) : apiKeys.length === 0 && !showAddForm ? (
            /* Empty state */
            <EmptyState
              icon={<Settings className="size-12" />}
              title="등록된 API 키가 없습니다"
              action={{
                label: "+ API 키 추가",
                onClick: handleAddClick,
              }}
            />
          ) : (
            <>
              {/* Inline Add Form */}
              {showAddForm && (
                <InlineAddForm
                  unregistered={unregisteredProviders}
                  onSave={handleAddSave}
                  onCancel={() => setShowAddForm(false)}
                />
              )}

              {/* Card list */}
              {apiKeys.map((entry) =>
                editingId === entry.id ? (
                  <InlineEditForm
                    key={entry.id}
                    entry={entry}
                    onSave={(key) => handleEditSave(entry.id, key)}
                    onCancel={() => setEditingId(null)}
                  />
                ) : (
                  <ApiKeyCard
                    key={entry.id}
                    entry={entry}
                    onEdit={() => {
                      setShowAddForm(false)
                      setEditingId(entry.id)
                    }}
                    onDelete={() => setDeleteTarget(entry)}
                  />
                )
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null)
        }}
        title="API 키 삭제"
        description="이 API 키를 삭제하시겠습니까? 삭제 시 요약 작업에 영향이 있을 수 있습니다."
        confirmText="삭제"
        cancelText="취소"
        variant="destructive"
        loading={deleteLoading}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  )
}
