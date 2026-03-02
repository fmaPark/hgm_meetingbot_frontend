import { StatusBadge, type MeetingStatus } from "@/components/status-badge"

interface MeetingInfoCardProps {
  title: string
  project: string
  part: string
  date: string
  status: MeetingStatus
}

export function MeetingInfoCard({
  title,
  project,
  part,
  date,
  status,
}: MeetingInfoCardProps) {
  return (
    <div className="rounded-lg bg-gray-50 p-4">
      <p className="font-semibold text-foreground">{title}</p>
      <p className="mt-1 text-sm text-text-secondary">
        {project} / {part}
      </p>
      <div className="mt-2 flex items-center justify-between">
        <span className="text-sm text-text-secondary">{date}</span>
        <StatusBadge status={status} />
      </div>
    </div>
  )
}
