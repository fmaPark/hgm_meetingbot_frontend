"use client"

import { useState, useCallback, useRef } from "react"
import {
  Pencil,
  Trash2,
  AlertTriangle,
  Loader2,
  Settings,
  CheckCircle,
  XCircle,
} from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { useIsMobile } from "@/hooks/use-mobile"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { useLlmSettings, useUpdateLlmSettings } from "@/lib/hooks/use-admin"
import { isValidApiKey, AVAILABLE_PROVIDERS } from "@/lib/apikey-types"

export function SystemSettingsPanel() {
  const { data: llmSettings, isLoading: loading } = useLlmSettings()
  const updateMutation = useUpdateLlmSettings()

  // Edit state per provider
  const [editingProvider, setEditingProvider] = useState<string | null>(null)
  const [keyValue, setKeyValue] = useState("")
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const isMobile = useIsMobile()

  const handleStartEdit = useCallback((providerId: string) => {
    setEditingProvider(providerId)
    setKeyValue("")
    setError(null)
  }, [])

  const handleCancelEdit = useCallback(() => {
    setEditingProvider(null)
    setKeyValue("")
    setError(null)
  }, [])

  const handleSave = useCallback(() => {
    if (!editingProvider) return

    if (!keyValue.trim()) {
      setError("API 키를 입력해주세요.")
      inputRef.current?.focus()
      return
    }
    if (!isValidApiKey(keyValue)) {
      setError("유효하지 않은 API 키입니다. 최소 8자 이상 입력해주세요.")
      inputRef.current?.focus()
      return
    }

    const payload =
      editingProvider === "openai"
        ? { openai_api_key: keyValue.trim() }
        : { gemini_api_key: keyValue.trim() }

    updateMutation.mutate(payload, {
      onSuccess: () => {
        setEditingProvider(null)
        setKeyValue("")
        setError(null)
        toast.success("API 키 저장 완료")
      },
      onError: () => toast.error("API 키 저장 실패"),
    })
  }, [editingProvider, keyValue, updateMutation])

  const handleDelete = useCallback(
    (providerId: string) => {
      const payload =
        providerId === "openai"
          ? { openai_api_key: null }
          : { gemini_api_key: null }

      updateMutation.mutate(payload as { openai_api_key?: string | null; gemini_api_key?: string | null }, {
        onSuccess: () => toast.success("API 키 삭제 완료"),
        onError: () => toast.error("API 키 삭제 실패"),
      })
    },
    [updateMutation]
  )

  const getIsSet = (providerId: string): boolean => {
    if (!llmSettings) return false
    if (providerId === "openai") return llmSettings.openai_api_key_set
    if (providerId === "gemini") return llmSettings.gemini_api_key_set
    return false
  }

  return (
    <div className="px-4 py-6">
      <Card className="border-border shadow-none">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-foreground">
            LLM API 키 설정
          </CardTitle>
          <CardDescription className="mt-1 text-sm text-text-secondary">
            AI 요약 기능에 사용되는 외부 LLM 서비스의 API 키를 관리합니다.
          </CardDescription>
        </CardHeader>

        <CardContent className="flex flex-col gap-3">
          {loading ? (
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
                </div>
              ))}
            </div>
          ) : (
            AVAILABLE_PROVIDERS.map((provider) => {
              const isSet = getIsSet(provider.id)
              const isEditing = editingProvider === provider.id

              if (isEditing) {
                return (
                  <div key={provider.id} className="rounded-lg border border-border bg-card p-4">
                    <h3 className="text-sm font-semibold text-foreground">
                      {provider.name}
                    </h3>

                    {!isMobile ? (
                      <>
                        <div className="mt-3 flex items-center gap-3">
                          <label className="shrink-0 text-sm text-text-secondary">
                            {isSet ? "새 API Key:" : "API Key:"}
                          </label>
                          <Input
                            ref={inputRef}
                            placeholder="API Key를 입력하세요"
                            value={keyValue}
                            onChange={(e) => {
                              setKeyValue(e.target.value)
                              if (error) setError(null)
                            }}
                            disabled={updateMutation.isPending}
                            className={cn("flex-1", error && "border-destructive")}
                          />
                        </div>
                        {error && (
                          <p className="mt-1.5 pl-[86px] text-xs text-destructive">{error}</p>
                        )}
                        <div className="mt-3 flex items-center justify-between">
                          <p className="flex items-center gap-1.5 text-xs text-text-secondary">
                            <AlertTriangle className="size-3.5 shrink-0 text-yellow-600" />
                            {isSet ? "기존 키는 새 키로 대체됩니다." : "API 키는 저장 후 마스킹되어 표시됩니다."}
                          </p>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={handleCancelEdit}
                              disabled={updateMutation.isPending}
                            >
                              취소
                            </Button>
                            <Button
                              size="sm"
                              onClick={handleSave}
                              disabled={updateMutation.isPending}
                              className="min-w-[80px]"
                            >
                              {updateMutation.isPending ? (
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
                      <>
                        <label className="mt-3 block text-sm text-text-secondary">
                          {isSet ? "새 API Key:" : "API Key:"}
                        </label>
                        <Input
                          ref={inputRef}
                          placeholder="API Key를 입력하세요"
                          value={keyValue}
                          onChange={(e) => {
                            setKeyValue(e.target.value)
                            if (error) setError(null)
                          }}
                          disabled={updateMutation.isPending}
                          className={cn("mt-1.5 w-full", error && "border-destructive")}
                        />
                        {error && (
                          <p className="mt-1.5 text-xs text-destructive">{error}</p>
                        )}
                        <p className="mt-2 flex items-center gap-1.5 text-xs text-text-secondary">
                          <AlertTriangle className="size-3.5 shrink-0 text-yellow-600" />
                          {isSet ? "기존 키는 새 키로 대체됩니다." : "API 키는 저장 후 마스킹되어 표시됩니다."}
                        </p>
                        <div className="mt-3 flex gap-2">
                          <Button
                            variant="outline"
                            onClick={handleCancelEdit}
                            disabled={updateMutation.isPending}
                            className="flex-1"
                          >
                            취소
                          </Button>
                          <Button
                            onClick={handleSave}
                            disabled={updateMutation.isPending}
                            className="min-w-[80px] flex-1"
                          >
                            {updateMutation.isPending ? (
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

              return (
                <div key={provider.id} className="rounded-lg border border-border bg-card p-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-foreground">
                      {provider.name}
                    </h3>
                    {isSet && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(provider.id)}
                        disabled={updateMutation.isPending}
                        className="gap-1.5 text-xs text-destructive hover:bg-destructive/10 hover:text-destructive"
                      >
                        <Trash2 className="size-3.5" />
                        삭제
                      </Button>
                    )}
                  </div>

                  <div className="mt-2 flex items-center gap-2">
                    <Badge
                      variant="secondary"
                      className={cn(
                        "gap-1 text-xs",
                        isSet
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-500"
                      )}
                    >
                      {isSet ? (
                        <CheckCircle className="size-3" />
                      ) : (
                        <XCircle className="size-3" />
                      )}
                      {isSet ? "등록됨" : "미등록"}
                    </Badge>
                  </div>

                  <div className="mt-3 flex items-center justify-end">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleStartEdit(provider.id)}
                      className="gap-1.5 text-xs"
                    >
                      <Pencil className="size-3.5" />
                      {isSet ? "변경" : "등록"}
                    </Button>
                  </div>
                </div>
              )
            })
          )}
        </CardContent>
      </Card>
    </div>
  )
}
