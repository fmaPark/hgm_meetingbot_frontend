import type { Meeting } from "@/lib/meeting-types"

export interface SummaryVersion {
  path: string
  label: string
  content: string
}

export interface MeetingSummaryData {
  meeting: Meeting
  versions: SummaryVersion[]
  asanaUrl?: string
}
