/**
 * Prompt & Keyword management UI types
 * Maps from API types (PromptData, KeywordData) for editing UI
 */

export type PromptItemType = "system" | "prefix" | "suffix"

export interface PromptItem {
  id: number
  type: PromptItemType
  content: string
}

export interface Prompt {
  id: number
  name: string
  isGlobal: boolean
  items: PromptItem[]
}

export interface KeywordSet {
  id: number
  name: string
  isGlobal: boolean
  keywords: string[]
}

export const KEYWORD_MAX = 50

export const PROMPT_TYPE_LABELS: Record<PromptItemType, string> = {
  system: "시스템 프롬프트",
  prefix: "프리픽스",
  suffix: "서픽스",
}

export const PROMPT_TYPE_DESCRIPTIONS: Record<PromptItemType, string> = {
  system: "AI 역할 정의",
  prefix: "요약 요청 전 추가되는 프롬프트",
  suffix: "요약 요청 후 추가되는 프롬프트",
}
