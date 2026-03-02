"use client"

import { useState, useEffect, useCallback } from "react"
import { X, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { useIsMobile } from "@/hooks/use-mobile"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Sheet,
  SheetContent,
} from "@/components/ui/sheet"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { PartPermissionTree } from "./part-permission-tree"
import { RoleManagementTab } from "./role-management-tab"
import type { AdminUser, UserRole, ProjectTreeItem, PartAccess } from "@/lib/admin-types"
import { SAMPLE_PROJECT_TREE, getInitials, getAllPartNames } from "@/lib/admin-types"

interface PermissionSettingsModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  user: AdminUser | null
  onSave: (userId: number, partAccess: PartAccess, roles: UserRole[]) => void
}

export function PermissionSettingsModal({
  open,
  onOpenChange,
  user,
  onSave,
}: PermissionSettingsModalProps) {
  const isMobile = useIsMobile()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  // Local state for editing
  const [allAccess, setAllAccess] = useState(false)
  const [selectedParts, setSelectedParts] = useState<string[]>([])
  const [selectedRoles, setSelectedRoles] = useState<UserRole[]>([])
  const [roleError, setRoleError] = useState(false)
  const [projectTree, setProjectTree] = useState<ProjectTreeItem[]>([])

  // Initialize state when user changes
  useEffect(() => {
    if (!open || !user) return

    setLoading(true)
    setRoleError(false)

    // Simulate loading the project tree and user's current settings
    const timer = setTimeout(() => {
      setProjectTree(SAMPLE_PROJECT_TREE)

      if (user.partAccess === "all") {
        setAllAccess(true)
        setSelectedParts(getAllPartNames(SAMPLE_PROJECT_TREE))
      } else {
        setAllAccess(false)
        setSelectedParts([...user.partAccess])
      }
      setSelectedRoles([...user.roles])
      setLoading(false)
    }, 500)

    return () => clearTimeout(timer)
  }, [open, user])

  const handleAllAccessChange = useCallback(
    (checked: boolean) => {
      setAllAccess(checked)
      if (checked) {
        setSelectedParts(getAllPartNames(projectTree))
      }
    },
    [projectTree]
  )

  const handleSave = useCallback(() => {
    if (!user) return

    if (selectedRoles.length === 0) {
      setRoleError(true)
      return
    }

    setSaving(true)
    // Simulate save
    setTimeout(() => {
      const partAccess: PartAccess = allAccess ? "all" : [...selectedParts]
      onSave(user.id, partAccess, selectedRoles)
      setSaving(false)
      onOpenChange(false)
      toast.success("저장 완료")
    }, 800)
  }, [user, allAccess, selectedParts, selectedRoles, onSave, onOpenChange])

  const handleCancel = useCallback(() => {
    if (saving) return
    onOpenChange(false)
  }, [saving, onOpenChange])

  if (!user) return null

  const userInfoCard = (
    <div className="flex items-center gap-3 rounded-lg border border-border bg-background p-3">
      <Avatar className="size-10">
        {user.avatar ? (
          <AvatarImage src={user.avatar} alt={user.name} />
        ) : null}
        <AvatarFallback className="bg-brand-green/10 text-sm font-medium text-brand-green">
          {getInitials(user.name)}
        </AvatarFallback>
      </Avatar>
      <div className="flex flex-col">
        <span className="text-sm font-semibold text-foreground">{user.name}</span>
        <span className="text-xs text-text-secondary">{user.email}</span>
      </div>
    </div>
  )

  const loadingSkeleton = (
    <div className="flex flex-col gap-4 p-4">
      <Skeleton className="h-16 w-full rounded-lg" />
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-40 w-full" />
    </div>
  )

  const modalContent = (
    <div className="flex flex-col gap-4">
      {userInfoCard}

      <Tabs defaultValue="parts" className="w-full gap-0">
        <TabsList className="h-10 w-full rounded-none border-b border-border bg-transparent p-0">
          <TabsTrigger
            value="parts"
            className="flex-1 rounded-none border-b-2 border-transparent bg-transparent text-sm font-medium text-text-secondary shadow-none data-[state=active]:border-b-brand-green data-[state=active]:bg-transparent data-[state=active]:text-foreground data-[state=active]:shadow-none"
          >
            파트 권한
          </TabsTrigger>
          <TabsTrigger
            value="roles"
            className="flex-1 rounded-none border-b-2 border-transparent bg-transparent text-sm font-medium text-text-secondary shadow-none data-[state=active]:border-b-brand-green data-[state=active]:bg-transparent data-[state=active]:text-foreground data-[state=active]:shadow-none"
          >
            역할 관리
          </TabsTrigger>
        </TabsList>

        <TabsContent value="parts" className="mt-4">
          <PartPermissionTree
            projectTree={projectTree}
            selectedParts={selectedParts}
            allAccess={allAccess}
            roles={selectedRoles}
            onAllAccessChange={handleAllAccessChange}
            onPartsChange={setSelectedParts}
            isMobile={isMobile}
          />
        </TabsContent>

        <TabsContent value="roles" className="mt-4">
          <RoleManagementTab
            selectedRoles={selectedRoles}
            onRolesChange={(roles) => {
              setSelectedRoles(roles)
              if (roles.length > 0) setRoleError(false)
            }}
            showError={roleError}
          />
        </TabsContent>
      </Tabs>
    </div>
  )

  const footerButtons = (
    <>
      <Button
        variant="outline"
        onClick={handleCancel}
        disabled={saving}
        className={cn(isMobile ? "min-h-[44px] flex-1" : "")}
      >
        취소
      </Button>
      <Button
        onClick={handleSave}
        disabled={saving}
        className={cn("min-w-[80px]", isMobile ? "min-h-[44px] flex-1" : "")}
      >
        {saving ? (
          <>
            <Loader2 className="size-4 animate-spin" />
            저장 중...
          </>
        ) : (
          "저장"
        )}
      </Button>
    </>
  )

  /* ─── Desktop: Dialog ──────────────────── */
  if (!isMobile) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="flex max-h-[80vh] max-w-[600px] flex-col gap-0 p-0">
          <DialogHeader className="border-b border-border px-6 py-4">
            <DialogTitle className="text-base font-semibold text-foreground">
              {user.name} 권한 설정
            </DialogTitle>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto px-6 py-4">
            {loading ? loadingSkeleton : modalContent}
          </div>

          <div className="flex items-center justify-end gap-2 border-t border-border px-6 py-3">
            {footerButtons}
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  /* ─── Mobile: Full-screen Sheet ────────── */
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        className="flex h-[100dvh] flex-col gap-0 rounded-t-none p-0 [&>button]:hidden"
      >
        {/* Fixed header */}
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <h2 className="text-base font-semibold text-foreground">
            {user.name} 권한 설정
          </h2>
          <Button
            variant="ghost"
            size="icon"
            className="size-8"
            onClick={handleCancel}
            aria-label="닫기"
          >
            <X className="size-4" />
          </Button>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto px-4 py-4">
          {loading ? loadingSkeleton : modalContent}
        </div>

        {/* Fixed footer */}
        <div className="flex gap-2 border-t border-border px-4 py-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))]">
          {footerButtons}
        </div>
      </SheetContent>
    </Sheet>
  )
}
