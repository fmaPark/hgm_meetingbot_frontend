import type { MeetingStatus } from "@/lib/api/types"

// UI-facing types for SttStep / AiSummaryStep subcomponents
export interface SttModel {
  id: string
  name: string
}

export interface LlmModel {
  id: string
  name: string
}

export interface PromptPreset {
  id: number
  name: string
  content: string
  isGlobal: boolean
}

export interface KeywordSet {
  id: number
  name: string
}

/** Check if Step 2 (AI Summary) should be enabled */
export function isStep2Enabled(status: MeetingStatus): boolean {
  return (
    status === "TRANSCRIBED" ||
    status === "SUMMARIZED" ||
    status === "UPLOADED" ||
    status === "FAILED"
  )
}

/** Check if the STT model select should be disabled */
export function isSttModelDisabled(status: MeetingStatus): boolean {
  return status === "PROCESSING" || status === "TRANSCRIBED"
}

/** Get the STT action button config based on status */
export function getSttButtonConfig(status: MeetingStatus): {
  label: string
  disabled: boolean
  variant: "default" | "outline"
} | null {
  switch (status) {
    case "STOPPED":
      return { label: "변환 시작", disabled: false, variant: "default" }
    case "PROCESSING":
      return { label: "변환 중...", disabled: true, variant: "default" }
    case "TRANSCRIBED":
      return { label: "재변환", disabled: false, variant: "outline" }
    case "FAILED":
      return { label: "재시도", disabled: false, variant: "default" }
    default:
      return null
  }
}
