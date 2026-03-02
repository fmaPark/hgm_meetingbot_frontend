import type { MeetingStatus } from "@/components/status-badge"

export interface SttModel {
  id: number
  name: string
}

export interface LlmModel {
  id: number
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

export const SAMPLE_STT_MODELS: SttModel[] = [
  { id: 1, name: "Whisper Large" },
  { id: 2, name: "Whisper Medium" },
]

export const SAMPLE_LLM_MODELS: LlmModel[] = [
  { id: 1, name: "GPT-4" },
  { id: 2, name: "GPT-3.5-turbo" },
  { id: 3, name: "Gemini Pro" },
]

export const SAMPLE_PROMPTS: PromptPreset[] = [
  {
    id: 1,
    name: "기본 요약 프롬프트",
    content:
      "다음 회의 내용을 요약해주세요. 주요 논의사항, 결정사항, 액션아이템을 구분하여 정리해주세요.",
    isGlobal: true,
  },
  {
    id: 2,
    name: "상세 요약",
    content:
      "다음 회의 내용을 상세하게 요약해주세요. 각 발언자의 주요 발언, 논의 흐름, 결론을 포함해주세요.",
    isGlobal: false,
  },
]

export const SAMPLE_KEYWORDS: KeywordSet[] = [
  { id: 0, name: "선택 안 함" },
  { id: 1, name: "기본 키워드" },
  { id: 2, name: "기술 용어" },
]

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
