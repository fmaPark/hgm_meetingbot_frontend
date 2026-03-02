"use client"

import { useState } from "react"
import { Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { MeetingStatus } from "@/components/status-badge"
import type {
  LlmModel,
  PromptPreset,
  KeywordSet,
} from "@/lib/summarize-types"
import { isStep2Enabled } from "@/lib/summarize-types"

interface AiSummaryStepProps {
  status: MeetingStatus
  llmModels: LlmModel[]
  prompts: PromptPreset[]
  keywords: KeywordSet[]
  selectedLlmModel: string
  onLlmModelChange: (value: string) => void
  selectedPrompt: string
  onPromptChange: (value: string) => void
  promptContent: string
  onPromptContentChange: (value: string) => void
  selectedKeyword: string
  onKeywordChange: (value: string) => void
  onStartSummarize: () => void
  onSavePrompt: (name: string) => void
  summarizeLoading?: boolean
  loading?: boolean
}

export function AiSummaryStep({
  status,
  llmModels,
  prompts,
  keywords,
  selectedLlmModel,
  onLlmModelChange,
  selectedPrompt,
  onPromptChange,
  promptContent,
  onPromptContentChange,
  selectedKeyword,
  onKeywordChange,
  onStartSummarize,
  onSavePrompt,
  summarizeLoading = false,
  loading = false,
}: AiSummaryStepProps) {
  const enabled = isStep2Enabled(status)
  const [saveMode, setSaveMode] = useState(false)
  const [saveName, setSaveName] = useState("")
  const [saving, setSaving] = useState(false)

  function handleSave() {
    if (!saveName.trim()) return
    setSaving(true)
    // Simulate save
    setTimeout(() => {
      onSavePrompt(saveName.trim())
      setSaveMode(false)
      setSaveName("")
      setSaving(false)
    }, 500)
  }

  return (
    <div className="relative rounded-lg border border-border p-4">
      {/* Disabled overlay */}
      {!enabled && (
        <div className="absolute inset-0 z-10 flex items-center justify-center rounded-lg bg-card/80">
          <p className="text-sm font-medium text-muted-foreground">
            {"1단계 완료 후 설정 가능"}
          </p>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center gap-2">
        <span className="flex size-6 items-center justify-center rounded-full bg-gray-200 text-xs font-semibold text-gray-600">
          2
        </span>
        <h3 className="text-sm font-semibold text-foreground">
          {"2단계: AI 요약"}
        </h3>
      </div>

      {/* Content */}
      <div className={`mt-4 flex flex-col gap-4 ${!enabled ? "opacity-50 pointer-events-none" : ""}`}>
        {/* LLM Model */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-foreground">
            LLM 모델
          </label>
          {loading ? (
            <Skeleton className="h-9 w-full md:w-[200px]" />
          ) : (
            <Select
              value={selectedLlmModel}
              onValueChange={onLlmModelChange}
              disabled={!enabled}
            >
              <SelectTrigger className="w-full md:w-[200px]">
                <SelectValue placeholder="모델 선택" />
              </SelectTrigger>
              <SelectContent>
                {llmModels.map((model) => (
                  <SelectItem key={model.id} value={String(model.id)}>
                    {model.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>

        {/* Prompt Select + Inline Save */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-foreground">
            프롬프트 선택
          </label>
          {loading ? (
            <Skeleton className="h-9 w-full" />
          ) : saveMode ? (
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <Select
                value={selectedPrompt}
                onValueChange={onPromptChange}
                disabled={!enabled}
              >
                <SelectTrigger className="w-full sm:flex-1">
                  <SelectValue placeholder="프롬프트 선택" />
                </SelectTrigger>
                <SelectContent>
                  {prompts.map((p) => (
                    <SelectItem key={p.id} value={String(p.id)}>
                      {p.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="flex items-center gap-2">
                <Input
                  placeholder="프롬프트 이름"
                  value={saveName}
                  onChange={(e) => setSaveName(e.target.value)}
                  className="min-w-0 flex-1 sm:w-[160px]"
                />
                <Button
                  size="sm"
                  disabled={!saveName.trim() || saving}
                  onClick={handleSave}
                  className="shrink-0"
                >
                  {saving ? (
                    <>
                      <Loader2 className="size-3.5 animate-spin" />
                      저장중...
                    </>
                  ) : (
                    "저장"
                  )}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setSaveMode(false)
                    setSaveName("")
                  }}
                  className="shrink-0"
                >
                  취소
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Select
                value={selectedPrompt}
                onValueChange={onPromptChange}
                disabled={!enabled}
              >
                <SelectTrigger className="w-full flex-1">
                  <SelectValue placeholder="프롬프트 선택" />
                </SelectTrigger>
                <SelectContent>
                  {prompts.map((p) => (
                    <SelectItem key={p.id} value={String(p.id)}>
                      {p.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setSaveMode(true)}
                disabled={!enabled}
                className="shrink-0"
              >
                새로 저장
              </Button>
            </div>
          )}
        </div>

        {/* Prompt Content */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-foreground">
            프롬프트 내용
          </label>
          {loading ? (
            <Skeleton className="h-[200px] w-full md:h-[200px]" />
          ) : (
            <Textarea
              value={promptContent}
              onChange={(e) => onPromptContentChange(e.target.value)}
              placeholder="요약 프롬프트를 입력하세요..."
              className="min-h-[150px] md:min-h-[200px]"
              disabled={!enabled}
            />
          )}
        </div>

        {/* Keyword Set */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-foreground">
            키워드 세트
          </label>
          {loading ? (
            <Skeleton className="h-9 w-full md:w-[200px]" />
          ) : (
            <Select
              value={selectedKeyword}
              onValueChange={onKeywordChange}
              disabled={!enabled}
            >
              <SelectTrigger className="w-full md:w-[200px]">
                <SelectValue placeholder="선택 안 함" />
              </SelectTrigger>
              <SelectContent>
                {keywords.map((kw) => (
                  <SelectItem key={kw.id} value={String(kw.id)}>
                    {kw.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>

        {/* Start Summarization Button */}
        <Button
          onClick={onStartSummarize}
          disabled={!enabled || summarizeLoading}
          className="w-full bg-[#2E7D32] text-white hover:bg-[#256d29]"
        >
          {summarizeLoading ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              요약 시작중...
            </>
          ) : (
            "요약 시작"
          )}
        </Button>
      </div>
    </div>
  )
}
