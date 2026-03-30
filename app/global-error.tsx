"use client"

import { useEffect } from "react"
import { AlertTriangle } from "lucide-react"

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error("Global error:", error)
  }, [error])

  return (
    <html lang="ko">
      <body>
        <div style={{
          display: "flex",
          minHeight: "100vh",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: "1.5rem",
          padding: "1rem",
          fontFamily: "system-ui, sans-serif",
        }}>
          <AlertTriangle style={{ width: 64, height: 64, color: "#ef4444" }} />
          <div style={{ textAlign: "center" }}>
            <h1 style={{ fontSize: "2.25rem", fontWeight: "bold" }}>500</h1>
            <p style={{ marginTop: "0.5rem", fontSize: "1.125rem", color: "#6b7280" }}>
              예기치 않은 오류가 발생했습니다
            </p>
            <p style={{ marginTop: "0.25rem", fontSize: "0.875rem", color: "#9ca3af" }}>
              문제가 지속되면 관리자에게 문의하세요.
            </p>
          </div>
          <button
            onClick={reset}
            style={{
              padding: "0.5rem 1.5rem",
              borderRadius: "0.375rem",
              backgroundColor: "#18181b",
              color: "#fff",
              fontSize: "0.875rem",
              fontWeight: 500,
              border: "none",
              cursor: "pointer",
            }}
          >
            다시 시도
          </button>
        </div>
      </body>
    </html>
  )
}
