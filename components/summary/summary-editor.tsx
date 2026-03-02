"use client"

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { MarkdownViewer } from "@/components/summary/markdown-viewer"
import { useIsMobile } from "@/hooks/use-mobile"

interface SummaryEditorProps {
  value: string
  onChange: (value: string) => void
  disabled?: boolean
}

export function SummaryEditor({
  value,
  onChange,
  disabled = false,
}: SummaryEditorProps) {
  const isMobile = useIsMobile()

  if (isMobile) {
    return (
      <Tabs defaultValue="edit" className="flex flex-1 flex-col">
        <TabsList className="w-full">
          <TabsTrigger value="edit" className="flex-1">
            편집
          </TabsTrigger>
          <TabsTrigger value="preview" className="flex-1">
            미리보기
          </TabsTrigger>
        </TabsList>
        <TabsContent value="edit" className="flex-1">
          <Textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            disabled={disabled}
            className="min-h-[300px] resize-none font-mono text-sm"
            placeholder="마크다운을 입력하세요..."
          />
        </TabsContent>
        <TabsContent value="preview" className="flex-1">
          <div className="min-h-[300px] overflow-y-auto rounded-md border border-border bg-card p-4">
            <MarkdownViewer content={value} />
          </div>
        </TabsContent>
      </Tabs>
    )
  }

  // Desktop: split view 50/50
  return (
    <div className="flex min-h-[300px] gap-4">
      {/* Left: Editor */}
      <div className="flex flex-1 flex-col">
        <span className="mb-2 text-xs font-medium text-text-secondary">
          편집
        </span>
        <Textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          className="flex-1 resize-none font-mono text-sm"
          placeholder="마크다운을 입력하세요..."
        />
      </div>

      {/* Right: Preview */}
      <div className="flex flex-1 flex-col">
        <span className="mb-2 text-xs font-medium text-text-secondary">
          미리보기
        </span>
        <div className="flex-1 overflow-y-auto rounded-md border border-border bg-card p-4">
          <MarkdownViewer content={value} />
        </div>
      </div>
    </div>
  )
}
