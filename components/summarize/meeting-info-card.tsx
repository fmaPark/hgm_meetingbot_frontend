import { StatusBadge } from "@/components/status-badge"
import type { MeetingStatus } from "@/lib/api/types"
import { formatRelativeDate } from "@/lib/meeting-types"

interface MeetingInfoCardProps {
  project: string
  part: string
  authorNick: string
  startTime: string
  status: MeetingStatus
}

export function MeetingInfoCard({
  project,
  part,
  authorNick,
  startTime,
  status,
}: MeetingInfoCardProps) {
  return (
    <div className="rounded-lg bg-gray-50 p-4">
      <p className="font-semibold text-foreground">
        {project} / {part}
      </p>
      <p className="mt-1 text-sm text-text-secondary">
        {authorNick}
      </p>
      <div className="mt-2 flex items-center justify-between">
        <span className="text-sm text-text-secondary">{formatRelativeDate(startTime)}</span>
        <StatusBadge status={status} />
      </div>
    </div>
  )
}
