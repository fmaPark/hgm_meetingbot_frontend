"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import { X } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { ConfirmDialog } from "@/components/confirm-dialog"
import { useIsMobile } from "@/hooks/use-mobile"

import type { Meeting, MeetingStatus } from "@/lib/meeting-types"
import type { PromptPreset } from "@/lib/summarize-types"
import { useSttModels, useLlmModels, usePrompts, useKeywords, useCreatePrompt } from "@/lib/hooks/use-prompts"
import { useTranscribeMeeting, useSummarizeMeeting } from "@/lib/hooks/use-meetings"

import { MeetingInfoCard } from "./meeting-info-card"
import { SttStep } from "./stt-step"
import { AiSummaryStep } from "./ai-summary-step"

interface SummarizeSettingsModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  meeting: Meeting | null
}

export function SummarizeSettingsModal({
  open,
  onOpenChange,
  meeting,
}: SummarizeSettingsModalProps) {
  const isMobile = useIsMobile()

  // API data queries
  const { data: sttModelNames = [], isLoading: sttLoading } = useSttModels()
  const { data: llmModelNames = [], isLoading: llmLoading } = useLlmModels()
  const { data: promptsData = [], isLoading: promptsLoading } = usePrompts()
  const { data: keywordsData = [], isLoading: keywordsLoading } = useKeywords()

  const configLoading = sttLoading || llmLoading || promptsLoading || keywordsLoading

  // Map API data to UI types
  const sttModels = useMemo(
    () => sttModelNames.map((name) => ({ id: name, name })),
    [sttModelNames]
  )
  const llmModels = useMemo(
    () => llmModelNames.map((name) => ({ id: name, name })),
    [llmModelNames]
  )
  const promptPresets: PromptPreset[] = useMemo(
    () =>
      promptsData.map((p) => ({
        id: p.id,
        name: p.name,
        content: p.prompts.map((t) => t.prompt_text).join("\n"),
        isGlobal: p.is_global,
      })),
    [promptsData]
  )
  const keywordSets = useMemo(
    () => [
      { id: 0, name: "선택 안 함" },
      ...keywordsData.map((k) => ({ id: k.id, name: k.name })),
    ],
    [keywordsData]
  )

  // Mutations
  const transcribeMutation = useTranscribeMeeting()
  const summarizeMutation = useSummarizeMeeting()
  const createPromptMutation = useCreatePrompt()

  // Current meeting status (can change as STT progresses)
  const [currentStatus, setCurrentStatus] = useState<MeetingStatus>("STOPPED")

  // STT state
  const [selectedSttModel, setSelectedSttModel] = useState("")

  // AI Summary state
  const [selectedLlmModel, setSelectedLlmModel] = useState("")
  const [selectedPrompt, setSelectedPrompt] = useState("")
  const [promptContent, setPromptContent] = useState("")
  const [selectedKeyword, setSelectedKeyword] = useState("0")

  // Close confirmation (when STT is processing)
  const [showCloseConfirm, setShowCloseConfirm] = useState(false)

  // Toast message
  const [toast, setToast] = useState<string | null>(null)

  // Reset state when meeting changes or modal opens
  useEffect(() => {
    if (open && meeting) {
      setCurrentStatus(meeting.status)
      setSelectedSttModel("")
      setSelectedLlmModel("")
      setSelectedPrompt("")
      setPromptContent("")
      setSelectedKeyword("0")
      setShowCloseConfirm(false)
      setToast(null)
    }
  }, [open, meeting])

  // Set defaults once config data is loaded
  useEffect(() => {
    if (!configLoading && open) {
      if (sttModels.length > 0 && !selectedSttModel) {
        setSelectedSttModel(sttModels[0].id)
      }
      if (llmModels.length > 0 && !selectedLlmModel) {
        setSelectedLlmModel(llmModels[0].id)
      }
      if (promptPresets.length > 0 && !selectedPrompt) {
        setSelectedPrompt(String(promptPresets[0].id))
        setPromptContent(promptPresets[0].content)
      }
    }
  }, [configLoading, open, sttModels, llmModels, promptPresets, selectedSttModel, selectedLlmModel, selectedPrompt])

  // Handle prompt preset change
  const handlePromptChange = useCallback(
    (value: string) => {
      setSelectedPrompt(value)
      const preset = promptPresets.find((p) => String(p.id) === value)
      if (preset) {
        setPromptContent(preset.content)
      }
    },
    [promptPresets]
  )

  // Handle save new prompt
  const handleSavePrompt = useCallback(
    (name: string) => {
      createPromptMutation.mutate(
        { name, prompts: [{ type: "system", prompt_text: promptContent }] },
        {
          onSuccess: () => {
            showToast("프롬프트 저장 완료")
          },
        }
      )
    },
    [promptContent, createPromptMutation]
  )

  // Start STT conversion
  const handleStartStt = useCallback(() => {
    if (!meeting) return
    setCurrentStatus("PROCESSING")
    transcribeMutation.mutate(
      { meetingId: meeting.id, data: { stt_model: selectedSttModel } },
      {
        onSuccess: () => {
          setCurrentStatus("TRANSCRIBED")
        },
        onError: () => {
          setCurrentStatus("FAILED")
        },
      }
    )
  }, [meeting, selectedSttModel, transcribeMutation])

  // Start AI summarization
  const handleStartSummarize = useCallback(() => {
    if (!meeting) return
    const selectedKw = keywordsData.find((k) => String(k.id) === selectedKeyword)
    const selectedPr = promptsData.find((p) => String(p.id) === selectedPrompt)

    summarizeMutation.mutate(
      {
        meetingId: meeting.id,
        data: {
          model: selectedLlmModel,
          instruction_name: selectedPr?.name ?? "",
          keywords_name: selectedKw?.name ?? "",
        },
      },
      {
        onSuccess: () => {
          showToast("요약을 시작합니다")
          setTimeout(() => onOpenChange(false), 800)
        },
      }
    )
  }, [meeting, selectedLlmModel, selectedPrompt, selectedKeyword, keywordsData, promptsData, summarizeMutation, onOpenChange])

  // Handle close attempt
  const handleCloseAttempt = useCallback(() => {
    if (currentStatus === "PROCESSING") {
      setShowCloseConfirm(true)
    } else {
      onOpenChange(false)
    }
  }, [currentStatus, onOpenChange])

  // Toast helper
  function showToast(message: string) {
    setToast(message)
    setTimeout(() => setToast(null), 2500)
  }

  if (!meeting) return null

  const modalContent = (
    <div className="flex flex-col gap-4">
      <MeetingInfoCard
        project={meeting.project}
        part={meeting.part}
        authorNick={meeting.author_nick}
        startTime={meeting.start_time}
        status={currentStatus}
      />

      <Separator />

      <SttStep
        status={currentStatus}
        sttModels={sttModels}
        selectedSttModel={selectedSttModel}
        onSttModelChange={setSelectedSttModel}
        onStartStt={handleStartStt}
        loading={configLoading}
      />

      <AiSummaryStep
        status={currentStatus}
        llmModels={llmModels}
        prompts={promptPresets}
        keywords={keywordSets}
        selectedLlmModel={selectedLlmModel}
        onLlmModelChange={setSelectedLlmModel}
        selectedPrompt={selectedPrompt}
        onPromptChange={handlePromptChange}
        promptContent={promptContent}
        onPromptContentChange={setPromptContent}
        selectedKeyword={selectedKeyword}
        onKeywordChange={setSelectedKeyword}
        onStartSummarize={handleStartSummarize}
        onSavePrompt={handleSavePrompt}
        summarizeLoading={summarizeMutation.isPending}
        loading={configLoading}
      />
    </div>
  )

  // Toast overlay
  const toastElement = toast && (
    <div className="pointer-events-none fixed inset-x-0 bottom-8 z-[100] flex justify-center">
      <div className="pointer-events-auto rounded-lg bg-foreground px-4 py-2.5 text-sm font-medium text-background shadow-lg">
        {toast}
      </div>
    </div>
  )

  // ── Mobile: Bottom Sheet (full height) ──
  if (isMobile) {
    return (
      <>
        <Sheet
          open={open}
          onOpenChange={(value) => {
            if (!value) {
              handleCloseAttempt()
            }
          }}
        >
          <SheetContent
            side="bottom"
            className="flex h-full flex-col gap-0 rounded-t-xl p-0 sm:max-w-none"
          >
            <SheetHeader className="flex flex-row items-center justify-between border-b border-border px-4 py-3">
              <SheetTitle className="text-base">요약 설정</SheetTitle>
              <button
                onClick={handleCloseAttempt}
                className="rounded-sm p-1 opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                aria-label="닫기"
              >
                <X className="size-5" />
              </button>
            </SheetHeader>

            <div className="flex-1 overflow-y-auto px-4 py-4">
              {modalContent}
            </div>

            <SheetFooter className="border-t border-border px-4 py-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))]">
              <Button
                variant="outline"
                onClick={handleCloseAttempt}
                className="w-full"
              >
                닫기
              </Button>
            </SheetFooter>
          </SheetContent>
        </Sheet>

        {toastElement}

        <ConfirmDialog
          open={showCloseConfirm}
          onOpenChange={setShowCloseConfirm}
          title="변환 진행 중"
          description="음성 변환이 진행 중입니다. 모달을 닫아도 변환은 계속됩니다. 닫으시겠습니까?"
          confirmText="닫기"
          cancelText="취소"
          variant="default"
          onConfirm={() => {
            setShowCloseConfirm(false)
            onOpenChange(false)
          }}
          onCancel={() => setShowCloseConfirm(false)}
        />
      </>
    )
  }

  // ── Desktop: Centered Dialog ──
  return (
    <>
      <Dialog
        open={open}
        onOpenChange={(value) => {
          if (!value) {
            handleCloseAttempt()
          }
        }}
      >
        <DialogContent
          showCloseButton={false}
          className="flex max-h-[85vh] max-w-[800px] flex-col gap-0 p-0"
        >
          <DialogHeader className="flex flex-row items-center justify-between border-b border-border px-6 py-4">
            <DialogTitle className="text-lg">요약 설정</DialogTitle>
            <button
              onClick={handleCloseAttempt}
              className="rounded-sm p-1 opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
              aria-label="닫기"
            >
              <X className="size-5" />
            </button>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto px-6 py-4">
            {modalContent}
          </div>

          <DialogFooter className="border-t border-border px-6 py-4">
            <Button variant="outline" onClick={handleCloseAttempt}>
              닫기
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {toastElement}

      <ConfirmDialog
        open={showCloseConfirm}
        onOpenChange={setShowCloseConfirm}
        title="변환 진행 중"
        description="음성 변환이 진행 중입니다. 모달을 닫아도 변환은 계속됩니다. 닫으시겠습니까?"
        confirmText="닫기"
        cancelText="취소"
        variant="default"
        onConfirm={() => {
          setShowCloseConfirm(false)
          onOpenChange(false)
        }}
        onCancel={() => setShowCloseConfirm(false)}
      />
    </>
  )
}
