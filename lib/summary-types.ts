import type { Meeting } from "@/lib/meeting-types"

export interface SummaryVersion {
  id: number
  label: string
  content: string
  createdAt: string
}

export interface MeetingSummaryData {
  meeting: Meeting
  versions: SummaryVersion[]
  asanaUrl?: string // Exists when status is UPLOADED
}

export const SAMPLE_MARKDOWN = `## 회의 요약

### 참석자
- 김철수 (기획)
- 이영희 (개발)
- 박민수 (디자인)

### 주요 논의 사항

1. **Q1 마일스톤 검토**
   - 현재 진행률 78%로 목표 대비 양호
   - 일부 디자인 리소스 부족 이슈 논의

2. **리소스 배분 논의**
   - 프론트엔드 개발자 1명 추가 투입 결정
   - 디자인 파트 외주 검토 예정

3. **다음 스프린트 계획**
   - 사용자 인증 모듈 우선 개발
   - API 설계 문서 검토 및 확정

### 액션 아이템

| 담당자 | 항목 | 기한 |
|--------|------|------|
| 김철수 | 기획서 수정 | 02/20 |
| 이영희 | API 설계 | 02/22 |
| 박민수 | UI 시안 | 02/21 |

### 다음 회의
- **일시**: 2026-02-26 14:00
- **안건**: 스프린트 리뷰
`

export const SAMPLE_MARKDOWN_V2 = `## 회의 요약 (수정본)

### 참석자
- 김철수 (기획)
- 이영희 (개발)
- 박민수 (디자인)
- 최지은 (QA)

### 주요 논의 사항

1. **Q1 마일스톤 재검토**
   - 진행률 82%로 상향 조정
   - QA 일정 포함하여 재산정

2. **리소스 배분 확정**
   - 프론트엔드 개발자 추가 투입 확정
   - 디자인 외주 업체 선정 완료

### 액션 아이템

| 담당자 | 항목 | 기한 |
|--------|------|------|
| 김철수 | 기획서 최종본 | 02/21 |
| 이영희 | API 설계 문서 | 02/23 |
| 박민수 | UI 시안 v2 | 02/22 |
| 최지은 | QA 계획서 | 02/24 |
`

export function getSampleSummaryData(meeting: Meeting): MeetingSummaryData {
  const versions: SummaryVersion[] = [
    {
      id: 1,
      label: "요약본 1 (기본)",
      content: SAMPLE_MARKDOWN,
      createdAt: "2026-02-19T14:30:00",
    },
  ]

  // Add a second version for UPLOADED meetings
  if (meeting.status === "UPLOADED") {
    versions.push({
      id: 2,
      label: "요약본 2",
      content: SAMPLE_MARKDOWN_V2,
      createdAt: "2026-02-19T16:00:00",
    })
  }

  return {
    meeting,
    versions,
    asanaUrl:
      meeting.status === "UPLOADED"
        ? "https://app.asana.com/0/example/task"
        : undefined,
  }
}
