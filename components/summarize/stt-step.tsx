"use client"

import { Loader2, Check, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import type { MeetingStatus } from "@/components/status-badge"
import type { SttModel } from "@/lib/summarize-types"
import {
  isSttModelDisabled,
  getSttButtonConfig,
} from "@/lib/summarize-types"

interface SttStepProps {
  status: MeetingStatus
  sttModels: SttModel[]
  selectedSttModel: string
  onSttModelChange: (value: string) => void
  onStartStt: () => void
  loading?: boolean
}

function StepIndicator({ status }: { status: MeetingStatus }) {
  if (status === "PROCESSING") {
    return (
      <span className="flex size-6 items-center justify-center rounded-full bg-blue-100">
        <Loader2 className="size-3.5 animate-spin text-blue-700" />
      </span>
    )
  }
  if (
    status === "TRANSCRIBED" ||
    status === "SUMMARIZED" ||
    status === "UPLOADED"
  ) {
    return (
      <span className="flex size-6 items-center justify-center rounded-full bg-green-100">
        <Check className="size-3.5 text-green-700" />
      </span>
    )
  }
  if (status === "FAILED") {
    return (
      <span className="flex size-6 items-center justify-center rounded-full bg-red-100">
        <AlertTriangle className="size-3.5 text-red-700" />
      </span>
    )
  }
  // STOPPED default
  return (
    <span className="flex size-6 items-center justify-center rounded-full bg-gray-200 text-xs font-semibold text-gray-600">
      1
    </span>
  )
}

function StatusDisplay({ status }: { status: MeetingStatus }) {
  if (status === "PROCESSING") {
    return (
      <div className="flex items-center gap-1.5 text-sm text-blue-700">
        <Loader2 className="size-4 animate-spin" />
        <span>변환 중...</span>
      </div>
    )
  }
  if (
    status === "TRANSCRIBED" ||
    status === "SUMMARIZED" ||
    status === "UPLOADED"
  ) {
    return (
      <div className="flex items-center gap-1.5 text-sm text-green-700">
        <Check className="size-4" />
        <span>변환 완료</span>
      </div>
    )
  }
  if (status === "FAILED") {
    return (
      <div className="flex items-center gap-1.5 text-sm text-red-700">
        <AlertTriangle className="size-4" />
        <span>변환 실패</span>
      </div>
    )
  }
  return null
}

export function SttStep({
  status,
  sttModels,
  selectedSttModel,
  onSttModelChange,
  onStartStt,
  loading = false,
}: SttStepProps) {
  const modelDisabled = isSttModelDisabled(status)
  const buttonConfig = getSttButtonConfig(status)

  return (
    <div className="rounded-lg border border-border p-4">
      {/* Header */}
      <div className="flex items-center gap-2">
        <StepIndicator status={status} />
        <h3 className="text-sm font-semibold text-foreground">
          {"1단계: 음성 변환 (STT)"}
        </h3>
      </div>

      {/* Content */}
      <div className="mt-4 flex flex-col gap-3">
        {/* STT Model Select */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-foreground">
            STT 모델
          </label>
          {loading ? (
            <Skeleton className="h-9 w-full" />
          ) : (
            <Select
              value={selectedSttModel}
              onValueChange={onSttModelChange}
              disabled={modelDisabled}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="모델 선택" />
              </SelectTrigger>
              <SelectContent>
                {sttModels.map((model) => (
                  <SelectItem key={model.id} value={String(model.id)}>
                    {model.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>

        {/* Status Display */}
        <StatusDisplay status={status} />

        {/* Action Button */}
        {buttonConfig && (
          <Button
            variant={buttonConfig.variant}
            disabled={buttonConfig.disabled}
            onClick={onStartStt}
            className="w-full"
          >
            {status === "PROCESSING" && (
              <Loader2 className="size-4 animate-spin" />
            )}
            {buttonConfig.label}
          </Button>
        )}
      </div>
    </div>
  )
}
