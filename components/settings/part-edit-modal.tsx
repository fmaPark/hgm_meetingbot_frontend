"use client"

import { useState, useEffect } from "react"
import { Info } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip"
import type { Part } from "@/lib/settings-types"

interface PartEditModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  part: Part | null // null = add mode
  onSave: (data: { name: string; driveId: string }) => void
}

export function PartEditModal({
  open,
  onOpenChange,
  part,
  onSave,
}: PartEditModalProps) {
  const isEdit = part !== null
  const [name, setName] = useState("")
  const [driveId, setDriveId] = useState("")

  // Reset form on open
  useEffect(() => {
    if (open) {
      setName(part?.name ?? "")
      setDriveId(part?.driveId ?? "")
    }
  }, [open, part])

  const canSave = name.trim() !== "" && driveId.trim() !== ""

  function handleSave() {
    if (!canSave) return
    onSave({ name: name.trim(), driveId: driveId.trim() })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[600px]">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "파트 편집" : "파트 추가"}
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-5 py-2">
          {/* Part Name */}
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="part-name"
              className="text-sm font-medium text-foreground"
            >
              파트명 <span className="text-destructive">*</span>
            </label>
            <Input
              id="part-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="파트명을 입력하세요"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault()
                  handleSave()
                }
              }}
            />
          </div>

          {/* Google Drive Folder ID */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-1.5">
              <label
                htmlFor="drive-id"
                className="text-sm font-medium text-foreground"
              >
                Google Drive 폴더 ID <span className="text-destructive">*</span>
              </label>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    className="inline-flex items-center text-text-secondary hover:text-foreground"
                    aria-label="폴더 ID 확인 방법"
                  >
                    <Info className="size-4" />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="top" className="max-w-[260px]">
                  Google Drive 폴더 URL에서 마지막 경로가 폴더 ID입니다.
                  <br />
                  {"예: drive.google.com/drive/folders/"}
                  <strong>{'<folder-id>'}</strong>
                </TooltipContent>
              </Tooltip>
            </div>
            <Input
              id="drive-id"
              value={driveId}
              onChange={(e) => setDriveId(e.target.value)}
              placeholder="폴더 ID를 입력하세요"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault()
                  handleSave()
                }
              }}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            취소
          </Button>
          <Button onClick={handleSave} disabled={!canSave}>
            저장
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
