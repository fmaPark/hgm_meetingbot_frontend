"use client"

import { useState, useCallback, useEffect, useRef } from "react"
import { toast } from "sonner"
import { AlertTriangle, ExternalLink, Loader2, X } from "lucide-react"
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
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { StatusBadge, type MeetingStatus } from "@/components/status-badge"
import { ConfirmDialog } from "@/components/confirm-dialog"
import { MarkdownViewer } from "@/components/summary/markdown-viewer"
import { SummaryEditor } from "@/components/summary/summary-editor"
import { useIsMobile } from "@/hooks/use-mobile"
import type { Meeting } from "@/lib/meeting-types"
import type { SummaryVersion, MeetingSummaryData } from "@/lib/summary-types"
import { getSampleSummaryData } from "@/lib/summary-types"

// ─── Types ──────────────────────────────────────────────
type ModalMode = "viewer" | "editor"
type DialogType = "delete" | "restore" | "unsaved" | null

interface MeetingSummaryModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  meeting: Meeting | null
  readOnly?: boolean // Trash mode
  onDelete?: (meetingId: number) => void
  onRestore?: (meetingId: number) => void
  onStatusChange?: (meetingId: number, newStatus: MeetingStatus) => void
}

// ─── Component ──────────────────────────────────────────
export function MeetingSummaryModal({
  open,
  onOpenChange,
  meeting,
  readOnly = false,
  onDelete,
  onRestore,
  onStatusChange,
}: MeetingSummaryModalProps) {
  const isMobile = useIsMobile()

  // Data states
  const [loading, setLoading] = useState(true)
  const [summaryData, setSummaryData] = useState<MeetingSummaryData | null>(null)
  const [activeVersionId, setActiveVersionId] = useState<number>(1)
  const [isReadOnly, setIsReadOnly] = useState(readOnly)

  // Editor states
  const [mode, setMode] = useState<ModalMode>("viewer")
  const [editContent, setEditContent] = useState("")
  const [saving, setSaving] = useState(false)

  // Dialog states
  const [activeDialog, setActiveDialog] = useState<DialogType>(null)
  const [dialogLoading, setDialogLoading] = useState(false)

  // Ref to track original content for dirty check
  const originalContent = useRef("")

  // ── Load data when meeting changes ──
  useEffect(() => {
    if (!open || !meeting) return

    setLoading(true)
    setMode("viewer")
    setActiveDialog(null)
    setIsReadOnly(readOnly)

    // Simulate API load
    const timer = setTimeout(() => {
      const data = getSampleSummaryData(meeting)
      setSummaryData(data)
      setActiveVersionId(data.versions[0]?.id ?? 1)
      setLoading(false)
    }, 600)

    return () => clearTimeout(timer)
  }, [open, meeting, readOnly])

  // ── Helpers ──
  const activeVersion: SummaryVersion | undefined =
    summaryData?.versions.find((v) => v.id === activeVersionId)

  const isDirty =
    mode === "editor" && editContent !== originalContent.current

  const meetingStatus = summaryData?.meeting.status ?? meeting?.status

  // ── Handlers ──
  const handleClose = useCallback(() => {
    if (isDirty) {
      setActiveDialog("unsaved")
    } else {
      onOpenChange(false)
    }
  }, [isDirty, onOpenChange])

  const handleEdit = useCallback(() => {
    if (!activeVersion) return
    originalContent.current = activeVersion.content
    setEditContent(activeVersion.content)
    setMode("editor")
  }, [activeVersion])

  const handleCancelEdit = useCallback(() => {
    if (isDirty) {
      setActiveDialog("unsaved")
    } else {
      setMode("viewer")
    }
  }, [isDirty])

  const handleSave = useCallback(() => {
    setSaving(true)
    setTimeout(() => {
      // Update the version content in local state
      setSummaryData((prev) => {
        if (!prev) return prev
        return {
          ...prev,
          versions: prev.versions.map((v) =>
            v.id === activeVersionId ? { ...v, content: editContent } : v
          ),
        }
      })
      originalContent.current = editContent
      setSaving(false)
      setMode("viewer")
      toast.success("저장 완료")
    }, 1000)
  }, [activeVersionId, editContent])

  const handleVersionChange = useCallback(
    (versionIdStr: string) => {
      const versionId = Number(versionIdStr)
      if (isDirty) {
        // Store the pending version change in a closure then show dialog
        setActiveDialog("unsaved")
        return
      }
      setActiveVersionId(versionId)
    },
    [isDirty]
  )

  const handleUploadToAsana = useCallback(() => {
    if (!meeting) return
    // Simulate upload
    toast.success("Asana 업로드 완료", {
      action: {
        label: "보러가기",
        onClick: () => window.open("https://app.asana.com/0/example/task", "_blank"),
      },
    })
    // Update status to UPLOADED
    setSummaryData((prev) => {
      if (!prev) return prev
      return {
        ...prev,
        meeting: { ...prev.meeting, status: "UPLOADED" as MeetingStatus },
        asanaUrl: "https://app.asana.com/0/example/task",
      }
    })
    onStatusChange?.(meeting.id, "UPLOADED")
  }, [meeting, onStatusChange])

  const handleReupload = useCallback(() => {
    if (!meeting) return
    toast.success("Asana에 다시 업로드되었습니다.", {
      action: {
        label: "보러가기",
        onClick: () =>
          window.open(summaryData?.asanaUrl ?? "https://app.asana.com", "_blank"),
      },
    })
  }, [meeting, summaryData?.asanaUrl])

  const handleDeleteConfirm = useCallback(() => {
    if (!meeting) return
    setDialogLoading(true)
    setTimeout(() => {
      setDialogLoading(false)
      setActiveDialog(null)
      onOpenChange(false)
      onDelete?.(meeting.id)
      toast.success("휴지통으로 이동")
    }, 1000)
  }, [meeting, onOpenChange, onDelete])

  const handleRestoreConfirm = useCallback(() => {
    if (!meeting) return
    setDialogLoading(true)
    setTimeout(() => {
      setDialogLoading(false)
      setActiveDialog(null)
      setIsReadOnly(false)
      onRestore?.(meeting.id)
      toast.success("복구 완료")
    }, 1000)
  }, [meeting, onRestore])

  const handleUnsavedConfirm = useCallback(() => {
    // Discard changes
    setActiveDialog(null)
    setEditContent(originalContent.current)
    setMode("viewer")
  }, [])

  // Force close (from unsaved dialog) while modal is open
  const handleForceClose = useCallback(() => {
    setActiveDialog(null)
    setEditContent(originalContent.current)
    setMode("viewer")
    onOpenChange(false)
  }, [onOpenChange])

  // ── Render Content Sections ──
  const renderWarningBanner = () => {
    if (!isReadOnly) return null
    return (
      <div className="flex items-start gap-2 rounded-md border border-amber-200 bg-amber-50 p-3">
        <AlertTriangle className="mt-0.5 size-4 shrink-0 text-amber-600" />
        <span className="text-sm text-amber-800">
          휴지통에 있는 항목입니다. 수정��려면 먼저 복구해주세요.
        </span>
      </div>
    )
  }

  const renderMeetingInfo = () => {
    if (!meeting) return null
    return (
      <div className="flex flex-wrap items-center gap-1 text-sm text-text-secondary">
        <span className="font-medium text-foreground">{meeting.title}</span>
        <span>{"·"}</span>
        <span>
          {meeting.project} / {meeting.part}
        </span>
        <span>{"·"}</span>
        <span>{meeting.date}</span>
        <span>{"·"}</span>
        <span>{meeting.host}</span>
      </div>
    )
  }

  const renderVersionTabs = () => {
    if (!summaryData || summaryData.versions.length <= 1) return null
    return (
      <Tabs
        value={String(activeVersionId)}
        onValueChange={handleVersionChange}
      >
        <TabsList>
          {summaryData.versions.map((v) => (
            <TabsTrigger key={v.id} value={String(v.id)}>
              {v.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
    )
  }

  const renderContent = () => {
    if (loading) {
      return (
        <div className="min-h-[300px] space-y-4 p-4">
          <Skeleton className="h-6 w-1/3" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
          <Skeleton className="h-4 w-4/6" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-2/3" />
        </div>
      )
    }

    if (mode === "editor") {
      return (
        <SummaryEditor
          value={editContent}
          onChange={setEditContent}
          disabled={saving}
        />
      )
    }

    // Viewer mode
    return (
      <div className="min-h-[300px] overflow-y-auto">
        <MarkdownViewer content={activeVersion?.content ?? ""} />
      </div>
    )
  }

  // ── Footer Buttons ──
  const renderFooter = () => {
    if (loading) {
      return (
        <div className="flex gap-2">
          <Skeleton className="h-9 w-20" />
          <Skeleton className="h-9 w-20" />
        </div>
      )
    }

    // Trash / readOnly mode
    if (isReadOnly) {
      if (isMobile) {
        return (
          <div className="flex w-full gap-2">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => onOpenChange(false)}
            >
              닫기
            </Button>
            <Button
              className="flex-1"
              onClick={() => setActiveDialog("restore")}
            >
              복구
            </Button>
          </div>
        )
      }
      return (
        <div className="flex w-full items-center justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            닫기
          </Button>
          <Button onClick={() => setActiveDialog("restore")}>복구</Button>
        </div>
      )
    }

    // Editor mode
    if (mode === "editor") {
      if (isMobile) {
        return (
          <div className="flex w-full gap-2">
            <Button
              variant="outline"
              className="flex-1"
              onClick={handleCancelEdit}
              disabled={saving}
            >
              취소
            </Button>
            <Button
              className="flex-1 min-w-[80px]"
              onClick={handleSave}
              disabled={saving}
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
        )
      }
      return (
        <div className="flex w-full items-center justify-end gap-2">
          <Button variant="outline" onClick={handleCancelEdit} disabled={saving}>
            취소
          </Button>
          <Button
            className="min-w-[80px]"
            onClick={handleSave}
            disabled={saving}
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
      )
    }

    // Viewer mode: UPLOADED status
    if (meetingStatus === "UPLOADED") {
      if (isMobile) {
        return (
          <div className="flex w-full flex-col gap-2">
            <Button variant="outline" onClick={handleEdit}>
              수정
            </Button>
            <Button variant="outline" onClick={handleReupload}>
              다시 업로드
            </Button>
            <Button
              variant="outline"
              className="gap-1.5"
              onClick={() =>
                window.open(
                  summaryData?.asanaUrl ?? "https://app.asana.com",
                  "_blank"
                )
              }
            >
              Asana에서 보기
              <ExternalLink className="size-3.5" />
            </Button>
            <Button
              variant="outline"
              className="text-destructive hover:bg-destructive/10 hover:text-destructive"
              onClick={() => setActiveDialog("delete")}
            >
              삭제
            </Button>
          </div>
        )
      }
      return (
        <div className="flex w-full items-center justify-between">
          <Button
            variant="outline"
            className="text-destructive hover:bg-destructive/10 hover:text-destructive"
            onClick={() => setActiveDialog("delete")}
          >
            삭제
          </Button>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={handleEdit}>
              수정
            </Button>
            <Button variant="outline" onClick={handleReupload}>
              다시 업로드
            </Button>
            <Button
              variant="outline"
              className="gap-1.5"
              onClick={() =>
                window.open(
                  summaryData?.asanaUrl ?? "https://app.asana.com",
                  "_blank"
                )
              }
            >
              Asana에서 보기
              <ExternalLink className="size-3.5" />
            </Button>
          </div>
        </div>
      )
    }

    // Viewer mode: SUMMARIZED (normal)
    if (isMobile) {
      return (
        <div className="flex w-full flex-col gap-2">
          <Button variant="outline" onClick={handleEdit}>
            수정
          </Button>
          <Button onClick={handleUploadToAsana}>Asana 업로드</Button>
          <Button
            variant="outline"
            className="text-destructive hover:bg-destructive/10 hover:text-destructive"
            onClick={() => setActiveDialog("delete")}
          >
            삭제
          </Button>
        </div>
      )
    }
    return (
      <div className="flex w-full items-center justify-between">
        <Button
          variant="outline"
          className="text-destructive hover:bg-destructive/10 hover:text-destructive"
          onClick={() => setActiveDialog("delete")}
        >
          삭제
        </Button>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleEdit}>
            수정
          </Button>
          <Button onClick={handleUploadToAsana}>Asana 업로드</Button>
        </div>
      </div>
    )
  }

  // ── Render Modal ──
  const modalBody = (
    <div className="flex flex-col gap-4">
      {renderWarningBanner()}
      {renderMeetingInfo()}
      {renderVersionTabs()}
      {renderContent()}
    </div>
  )

  const headerContent = (
    <div className="flex items-center gap-2">
      <span>요약 결과</span>
      {meetingStatus && (
        <StatusBadge status={meetingStatus} />
      )}
    </div>
  )

  if (isMobile) {
    return (
      <>
        <Sheet
          open={open}
          onOpenChange={(value) => {
            if (!value) handleClose()
          }}
        >
          <SheetContent
            side="bottom"
            className="flex h-[100dvh] flex-col gap-0 p-0"
          >
            <SheetHeader className="shrink-0 border-b border-border px-4 py-3">
              <SheetTitle>{headerContent}</SheetTitle>
            </SheetHeader>

            <div className="flex-1 overflow-y-auto px-4 py-4">
              {modalBody}
            </div>

            <SheetFooter className="shrink-0 border-t border-border px-4 py-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))]">
              {renderFooter()}
            </SheetFooter>
          </SheetContent>
        </Sheet>

        {/* Sub-dialogs */}
        <ConfirmDialog
          open={activeDialog === "delete"}
          onOpenChange={(v) => { if (!v) setActiveDialog(null) }}
          title="회의 삭제"
          description="휴지통으로 이동하시겠습니까? 30일 후 자동 삭제됩니다."
          confirmText="삭제"
          cancelText="취소"
          variant="destructive"
          loading={dialogLoading}
          onConfirm={handleDeleteConfirm}
          onCancel={() => setActiveDialog(null)}
        />
        <ConfirmDialog
          open={activeDialog === "restore"}
          onOpenChange={(v) => { if (!v) setActiveDialog(null) }}
          title="회의 복구"
          description="선택한 회의를 복구하시겠습니까?"
          confirmText="복구"
          cancelText="취소"
          variant="default"
          loading={dialogLoading}
          onConfirm={handleRestoreConfirm}
          onCancel={() => setActiveDialog(null)}
        />
        <ConfirmDialog
          open={activeDialog === "unsaved"}
          onOpenChange={(v) => { if (!v) setActiveDialog(null) }}
          title="변경사항 저장"
          description="저장하지 않은 변경사항이 있습니다. 저장하지 않고 나가시겠습니까?"
          confirmText="저장하지 않고 나가기"
          cancelText="취소"
          variant="default"
          loading={false}
          onConfirm={open && mode === "editor" ? handleUnsavedConfirm : handleForceClose}
          onCancel={() => setActiveDialog(null)}
        />
      </>
    )
  }

  // Desktop: Dialog
  return (
    <>
      <Dialog
        open={open}
        onOpenChange={(value) => {
          if (!value) handleClose()
        }}
      >
        <DialogContent
          className="flex max-h-[80vh] max-w-[800px] flex-col gap-0 p-0"
          showCloseButton={false}
        >
          <DialogHeader className="shrink-0 border-b border-border px-6 py-4">
            <div className="flex items-center justify-between">
              <DialogTitle>{headerContent}</DialogTitle>
              <button
                onClick={handleClose}
                className="rounded-sm p-1 opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                aria-label="닫기"
              >
                <X className="size-4" />
              </button>
            </div>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto px-6 py-4">
            {modalBody}
          </div>

          <DialogFooter className="shrink-0 border-t border-border px-6 py-4">
            {renderFooter()}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Sub-dialogs */}
      <ConfirmDialog
        open={activeDialog === "delete"}
        onOpenChange={(v) => { if (!v) setActiveDialog(null) }}
        title="회의 삭제"
        description="휴지통으로 이동하시겠습니까? 30일 후 자동 삭제됩니다."
        confirmText="삭제"
        cancelText="취소"
        variant="destructive"
        loading={dialogLoading}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setActiveDialog(null)}
      />
      <ConfirmDialog
        open={activeDialog === "restore"}
        onOpenChange={(v) => { if (!v) setActiveDialog(null) }}
        title="회의 복구"
        description="선택한 회의를 복구하시겠습니까?"
        confirmText="복구"
        cancelText="취소"
        variant="default"
        loading={dialogLoading}
        onConfirm={handleRestoreConfirm}
        onCancel={() => setActiveDialog(null)}
      />
      <ConfirmDialog
        open={activeDialog === "unsaved"}
        onOpenChange={(v) => { if (!v) setActiveDialog(null) }}
        title="변경사항 저장"
        description="저장하지 않은 변경사항이 있습니다. 저장하지 않고 나가시겠습니까?"
        confirmText="저장하지 않고 나가기"
        cancelText="취소"
        variant="default"
        loading={false}
        onConfirm={open && mode === "editor" ? handleUnsavedConfirm : handleForceClose}
        onCancel={() => setActiveDialog(null)}
      />
    </>
  )
}
