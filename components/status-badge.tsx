import { type ReactNode } from "react"
import { Loader2, Check, AlertTriangle } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

export type MeetingStatus =
  | "RECORDING"
  | "STOPPED"
  | "TRANSCRIBED"
  | "PROCESSING"
  | "SUMMARIZED"
  | "UPLOADED"
  | "FAILED"

interface StatusConfig {
  label: string
  className: string
  icon?: ReactNode
}

const STATUS_MAP: Record<MeetingStatus, StatusConfig> = {
  RECORDING: {
    label: "녹음중",
    className: "bg-yellow-100 text-yellow-800",
    icon: (
      <span className="relative flex h-2 w-2">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-yellow-600 opacity-75" />
        <span className="relative inline-flex h-2 w-2 rounded-full bg-yellow-600" />
      </span>
    ),
  },
  STOPPED: {
    label: "대기",
    className: "bg-gray-100 text-gray-700",
  },
  TRANSCRIBED: {
    label: "변환완료",
    className: "bg-blue-100 text-blue-800",
  },
  PROCESSING: {
    label: "처리중",
    className: "bg-blue-100 text-blue-800",
    icon: <Loader2 className="h-3 w-3 animate-spin" />,
  },
  SUMMARIZED: {
    label: "요약완료",
    className: "bg-green-100 text-green-800",
    icon: <Check className="h-3 w-3" />,
  },
  UPLOADED: {
    label: "업로드완료",
    className: "bg-purple-100 text-purple-800",
    icon: <Check className="h-3 w-3" />,
  },
  FAILED: {
    label: "실패",
    className: "bg-red-100 text-red-800",
    icon: <AlertTriangle className="h-3 w-3" />,
  },
}

interface StatusBadgeProps {
  status: MeetingStatus
  className?: string
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = STATUS_MAP[status]

  return (
    <Badge
      variant="outline"
      className={cn(
        "inline-flex items-center gap-1 rounded-full border-transparent px-2 py-0.5 text-xs font-medium",
        config.className,
        className
      )}
    >
      {config.icon}
      {config.label}
    </Badge>
  )
}
