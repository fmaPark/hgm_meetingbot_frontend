"use client"

import { useState, useEffect } from "react"
import { Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import type { Part, AsanaConfig } from "@/lib/settings-types"
import { parseAsanaUrl } from "@/lib/settings-types"

interface AsanaSettingsModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  part: Part | null
  onSave: (partId: number, config: AsanaConfig) => void
}

export function AsanaSettingsModal({
  open,
  onOpenChange,
  part,
  onSave,
}: AsanaSettingsModalProps) {
  const [url, setUrl] = useState("")
  const [workspaceId, setWorkspaceId] = useState("")
  const [projectId, setProjectId] = useState("")
  const [sectionId, setSectionId] = useState("")
  const [fetching, setFetching] = useState(false)

  // Reset form when opening
  useEffect(() => {
    if (open && part) {
      const config = part.asanaConfig
      setUrl(config?.url ?? "")
      setWorkspaceId(config?.workspaceId ?? "")
      setProjectId(config?.projectId ?? "")
      setSectionId(config?.sectionId ?? "")
    }
  }, [open, part])

  const canSave = projectId.trim() !== ""

  function handleFetchInfo() {
    if (!url.trim()) return
    setFetching(true)

    // Simulate API call + URL parsing
    setTimeout(() => {
      const parsed = parseAsanaUrl(url)
      if (parsed.workspaceId) setWorkspaceId(parsed.workspaceId)
      if (parsed.projectId) setProjectId(parsed.projectId)
      if (parsed.sectionId) setSectionId(parsed.sectionId)
      setFetching(false)
    }, 800)
  }

  function handleSave() {
    if (!canSave || !part) return
    onSave(part.id, {
      url: url.trim() || undefined,
      workspaceId: workspaceId.trim() || undefined,
      projectId: projectId.trim() || undefined,
      sectionId: sectionId.trim() || undefined,
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[600px]">
        <DialogHeader>
          <DialogTitle>
            Asana 설정 - {part?.name ?? ""}
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-5 py-2">
          {/* Asana URL with fetch button */}
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="asana-url"
              className="text-sm font-medium text-foreground"
            >
              Asana URL
            </label>
            <div className="flex items-center gap-2">
              <Input
                id="asana-url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="Asana 프로젝트/섹션 URL"
                className="flex-1"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault()
                    handleFetchInfo()
                  }
                }}
              />
              <Button
                variant="outline"
                size="sm"
                onClick={handleFetchInfo}
                disabled={!url.trim() || fetching}
                className="shrink-0 min-w-[100px]"
              >
                {fetching ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    가져오는 중...
                  </>
                ) : (
                  "정보 가져오기"
                )}
              </Button>
            </div>
          </div>

          {/* Workspace ID */}
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="workspace-id"
              className="text-sm font-medium text-foreground"
            >
              Workspace ID
            </label>
            <Input
              id="workspace-id"
              value={workspaceId}
              onChange={(e) => setWorkspaceId(e.target.value)}
              placeholder="자동 입력 또는 직접 입력"
            />
          </div>

          {/* Project ID */}
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="project-id"
              className="text-sm font-medium text-foreground"
            >
              Project ID <span className="text-destructive">*</span>
            </label>
            <Input
              id="project-id"
              value={projectId}
              onChange={(e) => setProjectId(e.target.value)}
              placeholder="자동 입력 또는 직접 입력"
            />
          </div>

          {/* Section ID */}
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="section-id"
              className="text-sm font-medium text-foreground"
            >
              Section ID
            </label>
            <Input
              id="section-id"
              value={sectionId}
              onChange={(e) => setSectionId(e.target.value)}
              placeholder="자동 입력 또는 직접 입력"
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
