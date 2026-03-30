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

interface AsanaSettingsModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  part: Part | null
  onSave: (partId: number, config: AsanaConfig) => void
  onFetchFromUrl?: (url: string, fieldName: string, enumName: string, driveFieldName: string) => Promise<AsanaConfig>
  fetching?: boolean
}

export function AsanaSettingsModal({
  open,
  onOpenChange,
  part,
  onSave,
  onFetchFromUrl,
  fetching = false,
}: AsanaSettingsModalProps) {
  // URL inputs for auto-extraction
  const [url, setUrl] = useState("")
  const [fieldName, setFieldName] = useState("")
  const [enumName, setEnumName] = useState("")
  const [driveFieldName, setDriveFieldName] = useState("")

  // Result fields (API AsanaConfig)
  const [projectId, setProjectId] = useState("")
  const [projectField, setProjectField] = useState("")
  const [projectFieldId, setProjectFieldId] = useState("")
  const [driveFieldId, setDriveFieldId] = useState("")

  // Reset form when opening
  useEffect(() => {
    if (open && part) {
      const config = part.asana_config
      setUrl("")
      setFieldName("")
      setEnumName("")
      setDriveFieldName("")
      setProjectId(config?.project_id ?? "")
      setProjectField(config?.project_field ?? "")
      setProjectFieldId(config?.project_field_id ?? "")
      setDriveFieldId(config?.drive_field_id ?? "")
    }
  }, [open, part])

  const canSave = projectId.trim() !== ""

  async function handleFetchInfo() {
    if (!url.trim() || !onFetchFromUrl) return
    try {
      const config = await onFetchFromUrl(
        url.trim(),
        fieldName.trim(),
        enumName.trim(),
        driveFieldName.trim(),
      )
      if (config.project_id) setProjectId(config.project_id)
      if (config.project_field) setProjectField(config.project_field)
      if (config.project_field_id) setProjectFieldId(config.project_field_id)
      if (config.drive_field_id) setDriveFieldId(config.drive_field_id)
    } catch {
      // Error handled by parent via mutation
    }
  }

  function handleSave() {
    if (!canSave || !part) return
    onSave(part.id, {
      project_id: projectId.trim() || null,
      project_field: projectField.trim() || null,
      project_field_id: projectFieldId.trim() || null,
      drive_field_id: driveFieldId.trim() || null,
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
                placeholder="Asana 프로젝트 URL"
                className="flex-1"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={handleFetchInfo}
                disabled={!url.trim() || fetching || !onFetchFromUrl}
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

          {/* Field Name / Enum Name / Drive Field Name (for URL extraction) */}
          <div className="grid grid-cols-3 gap-2">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-foreground">
                필드명
              </label>
              <Input
                value={fieldName}
                onChange={(e) => setFieldName(e.target.value)}
                placeholder="field_name"
                className="text-sm"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-foreground">
                Enum명
              </label>
              <Input
                value={enumName}
                onChange={(e) => setEnumName(e.target.value)}
                placeholder="enum_name"
                className="text-sm"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-foreground">
                드라이브 필드명
              </label>
              <Input
                value={driveFieldName}
                onChange={(e) => setDriveFieldName(e.target.value)}
                placeholder="drive_field_name"
                className="text-sm"
              />
            </div>
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

          {/* Project Field */}
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="project-field"
              className="text-sm font-medium text-foreground"
            >
              Project Field
            </label>
            <Input
              id="project-field"
              value={projectField}
              onChange={(e) => setProjectField(e.target.value)}
              placeholder="자동 입력 또는 직접 입력"
            />
          </div>

          {/* Project Field ID */}
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="project-field-id"
              className="text-sm font-medium text-foreground"
            >
              Project Field ID
            </label>
            <Input
              id="project-field-id"
              value={projectFieldId}
              onChange={(e) => setProjectFieldId(e.target.value)}
              placeholder="자동 입력 또는 직접 입력"
            />
          </div>

          {/* Drive Field ID */}
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="drive-field-id"
              className="text-sm font-medium text-foreground"
            >
              Drive Field ID
            </label>
            <Input
              id="drive-field-id"
              value={driveFieldId}
              onChange={(e) => setDriveFieldId(e.target.value)}
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
