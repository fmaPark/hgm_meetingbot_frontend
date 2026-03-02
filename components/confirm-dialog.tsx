"use client"

import { useCallback, useEffect } from "react"
import { Loader2 } from "lucide-react"
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"

export interface ConfirmDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description: string
  confirmText?: string
  cancelText?: string
  variant?: "default" | "destructive"
  loading?: boolean
  onConfirm: () => void
  onCancel?: () => void
}

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmText = "확인",
  cancelText = "취소",
  variant = "default",
  loading = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const handleCancel = useCallback(() => {
    if (loading) return
    onCancel?.()
    onOpenChange(false)
  }, [loading, onCancel, onOpenChange])

  const handleConfirm = useCallback(() => {
    if (loading) return
    onConfirm()
  }, [loading, onConfirm])

  // Enter key triggers confirm only for non-destructive variant
  useEffect(() => {
    if (!open) return

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Enter" && variant !== "destructive" && !loading) {
        e.preventDefault()
        handleConfirm()
      }
    }

    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [open, variant, loading, handleConfirm])

  return (
    <AlertDialog open={open} onOpenChange={(value) => {
      // When closing via ESC or overlay click, treat as cancel
      if (!value) {
        handleCancel()
      }
    }}>
      <AlertDialogContent className="max-w-[400px] p-6">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-lg font-semibold text-foreground">
            {title}
          </AlertDialogTitle>
          <AlertDialogDescription className="mt-2 text-sm text-text-secondary">
            {description}
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter className="flex flex-row items-center justify-end gap-2">
          <AlertDialogCancel
            onClick={handleCancel}
            disabled={loading}
            className="mt-0"
          >
            {cancelText}
          </AlertDialogCancel>

          <Button
            variant={variant === "destructive" ? "destructive" : "default"}
            onClick={handleConfirm}
            disabled={loading}
            className="min-w-[80px]"
          >
            {loading ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                처리 중...
              </>
            ) : (
              confirmText
            )}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
