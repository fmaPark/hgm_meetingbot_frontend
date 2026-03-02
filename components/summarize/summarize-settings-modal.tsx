"use client"

import { useState, useEffect, useCallback } from "react"
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

import type { Meeting } from "@/lib/meeting-types"
import type { MeetingStatus } from "@/components/status-badge"
import {
  SAMPLE_STT_MODELS,
  SAMPLE_LLM_MODELS,
  SAMPLE_PROMPTS,
  SAMPLE_KEYWORDS,
  type PromptPreset,
} from "@/lib/summarize-types"

import { MeetingInfoCard } from "./meeting-info-card"
import { SttStep } from "./stt-step"
import { AiSummaryStep } from "./ai-summary-step"

interface SummarizeSettingsModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  meeting: Meeting | null
  onStatusChange?: (meetingId: number, newStatus: MeetingStatus) => void
}

export function SummarizeSettingsModal({
  open,
  onOpenChange,
  meeting,
  onStatusChange,
}: SummarizeSettingsModalProps) {
  const isMobile = useIsMobile()

  // Loading state (simulate fetching config data)
  const [configLoading, setConfigLoading] = useState(true)

  // Current meeting status (can change as STT progresses)
  const [currentStatus, setCurrentStatus] = useState<MeetingStatus>("STOPPED")

  // STT state
  const [selectedSttModel, setSelectedSttModel] = useState("")

  // AI Summary state
  const [selectedLlmModel, setSelectedLlmModel] = useState("")
  const [selectedPrompt, setSelectedPrompt] = useState("")
  const [promptContent, setPromptContent] = useState("")
  const [selectedKeyword, setSelectedKeyword] = useState("0")
  const [summarizeLoading, setSummarizeLoading] = useState(false)

  // Prompt presets (mutable, can add new ones)
  const [prompts, setPrompts] = useState<PromptPreset[]>([])

  // Close confirmation (when STT is processing)
  const [showCloseConfirm, setShowCloseConfirm] = useState(false)

  // Toast message
  const [toast, setToast] = useState<string | null>(null)

  // Reset state when meeting changes or modal opens
  useEffect(() => {
    if (open && meeting) {
      setConfigLoading(true)
      setCurrentStatus(meeting.status)
      setSelectedSttModel(String(SAMPLE_STT_MODELS[0].id))
      setSelectedLlmModel(String(SAMPLE_LLM_MODELS[0].id))
      setPrompts([...SAMPLE_PROMPTS])
      setSelectedPrompt(String(SAMPLE_PROMPTS[0].id))
      setPromptContent(SAMPLE_PROMPTS[0].content)
      setSelectedKeyword("0")
      setSummarizeLoading(false)
      setShowCloseConfirm(false)
      setToast(null)

      // Simulate config loading
      const timer = setTimeout(() => setConfigLoading(false), 600)
      return () => clearTimeout(timer)
    }
  }, [open, meeting])

  // Handle prompt preset change
  const handlePromptChange = useCallback(
    (value: string) => {
      setSelectedPrompt(value)
      const preset = prompts.find((p) => String(p.id) === value)
      if (preset) {
        setPromptContent(preset.content)
      }
    },
    [prompts]
  )

  // Handle save new prompt
  const handleSavePrompt = useCallback(
    (name: string) => {
      const newPrompt: PromptPreset = {
        id: Math.max(...prompts.map((p) => p.id)) + 1,
        name,
        content: promptContent,
        isGlobal: false,
      }
      setPrompts((prev) => [...prev, newPrompt])
      setSelectedPrompt(String(newPrompt.id))
      showToast("프롬프트 저장 완료")
    },
    [prompts, promptContent]
  )

  // Start STT conversion
  const handleStartStt = useCallback(() => {
    if (!meeting) return
    setCurrentStatus("PROCESSING")
    onStatusChange?.(meeting.id, "PROCESSING")

    // Simulate STT processing (3 seconds)
    setTimeout(() => {
      setCurrentStatus("TRANSCRIBED")
      onStatusChange?.(meeting.id, "TRANSCRIBED")
    }, 3000)
  }, [meeting, onStatusChange])

  // Start AI summarization
  const handleStartSummarize = useCallback(() => {
    if (!meeting) return
    setSummarizeLoading(true)

    setTimeout(() => {
      setSummarizeLoading(false)
      onStatusChange?.(meeting.id, "PROCESSING")
      showToast("요약을 시작합니다")

      // Close modal after short delay so user sees the toast
      setTimeout(() => {
        onOpenChange(false)
      }, 800)
    }, 500)
  }, [meeting, onStatusChange, onOpenChange])

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
        title={meeting.title}
        project={meeting.project}
        part={meeting.part}
        date={meeting.date}
        status={currentStatus}
      />

      <Separator />

      <SttStep
        status={currentStatus}
        sttModels={SAMPLE_STT_MODELS}
        selectedSttModel={selectedSttModel}
        onSttModelChange={setSelectedSttModel}
        onStartStt={handleStartStt}
        loading={configLoading}
      />

      <AiSummaryStep
        status={currentStatus}
        llmModels={SAMPLE_LLM_MODELS}
        prompts={prompts}
        keywords={SAMPLE_KEYWORDS}
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
        summarizeLoading={summarizeLoading}
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
            {/* Fixed Header */}
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

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto px-4 py-4">
              {modalContent}
            </div>

            {/* Fixed Footer */}
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
          {/* Header */}
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

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto px-6 py-4">
            {modalContent}
          </div>

          {/* Footer */}
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
