// Prompt & Keyword management types and sample data

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
  createdAt: string // ISO date
  items: PromptItem[]
}

export interface KeywordSet {
  id: number
  name: string
  isGlobal: boolean
  createdAt: string
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

export const SAMPLE_PROMPTS: Prompt[] = [
  {
    id: 1,
    name: "기본 요약 프롬프트",
    isGlobal: true,
    createdAt: "2026-01-01T00:00:00Z",
    items: [
      {
        id: 1,
        type: "system",
        content:
          "당신은 회의록 요약 전문가입니다. 회의 내용을 구조화하여 핵심 논의사항, 결정사항, 액션 아이템으로 분류하세요.",
      },
      {
        id: 2,
        type: "prefix",
        content: "다음 회의 내용을 요약해주세요:",
      },
      {
        id: 3,
        type: "suffix",
        content: "액션 아이템을 표 형식으로 정리해주세요.",
      },
    ],
  },
  {
    id: 2,
    name: "상세 요약",
    isGlobal: false,
    createdAt: "2026-01-15T00:00:00Z",
    items: [
      {
        id: 4,
        type: "system",
        content:
          "상세하게 요약해주세요. 각 발언자의 의견을 포함하고, 논의의 흐름을 시간순으로 정리하세요.",
      },
    ],
  },
]

export const SAMPLE_KEYWORD_SETS: KeywordSet[] = [
  {
    id: 1,
    name: "기본 키워드",
    isGlobal: true,
    createdAt: "2026-01-01T00:00:00Z",
    keywords: ["HGM", "스프린트", "마일스톤", "PR리뷰", "QA", "배포", "핫픽스"],
  },
  {
    id: 2,
    name: "기술 용어",
    isGlobal: false,
    createdAt: "2026-01-10T00:00:00Z",
    keywords: ["API", "SDK", "CI/CD", "Docker", "Kubernetes"],
  },
]
