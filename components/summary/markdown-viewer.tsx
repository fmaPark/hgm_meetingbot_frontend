"use client"

import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import DOMPurify from "dompurify"

interface MarkdownViewerProps {
  content: string
  className?: string
}

export function MarkdownViewer({ content, className }: MarkdownViewerProps) {
  // Sanitize the markdown content before rendering
  const sanitized = typeof window !== "undefined"
    ? DOMPurify.sanitize(content)
    : content

  return (
    <div
      className={className}
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h2: ({ children }) => (
            <h2 className="mb-3 mt-6 text-lg font-bold text-foreground first:mt-0">
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="mb-2 mt-4 text-base font-semibold text-foreground">
              {children}
            </h3>
          ),
          p: ({ children }) => (
            <p className="mb-3 text-sm leading-relaxed text-foreground">
              {children}
            </p>
          ),
          ul: ({ children }) => (
            <ul className="mb-3 list-disc space-y-1 pl-5 text-sm text-foreground">
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className="mb-3 list-decimal space-y-1 pl-5 text-sm text-foreground">
              {children}
            </ol>
          ),
          li: ({ children }) => (
            <li className="text-sm leading-relaxed text-foreground">
              {children}
            </li>
          ),
          strong: ({ children }) => (
            <strong className="font-semibold text-foreground">{children}</strong>
          ),
          table: ({ children }) => (
            <div className="mb-3 overflow-x-auto rounded-md border border-border">
              <table className="w-full text-sm">{children}</table>
            </div>
          ),
          thead: ({ children }) => (
            <thead className="bg-muted">{children}</thead>
          ),
          th: ({ children }) => (
            <th className="px-3 py-2 text-left text-xs font-semibold text-foreground">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="border-t border-border px-3 py-2 text-sm text-foreground">
              {children}
            </td>
          ),
          code: ({ children, className: codeClassName }) => {
            // Inline code vs block code
            const isBlock = codeClassName?.includes("language-")
            if (isBlock) {
              return (
                <pre className="mb-3 overflow-x-auto rounded-md bg-muted p-3">
                  <code className="text-xs font-mono text-foreground">
                    {children}
                  </code>
                </pre>
              )
            }
            return (
              <code className="rounded bg-muted px-1.5 py-0.5 text-xs font-mono text-foreground">
                {children}
              </code>
            )
          },
          blockquote: ({ children }) => (
            <blockquote className="mb-3 border-l-4 border-primary pl-4 italic text-text-secondary">
              {children}
            </blockquote>
          ),
        }}
      >
        {sanitized}
      </ReactMarkdown>
    </div>
  )
}
