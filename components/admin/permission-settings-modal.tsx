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
import type { AdminUser } from "@/lib/admin-types"
import { getInitials } from "@/lib/admin-types"
import { useProjects } from "@/lib/hooks/use-projects"
import { useUpdateUserPermissions, useAssignRole, useRevokeRole, useRoles } from "@/lib/hooks/use-admin"
import type { Project } from "@/lib/api/types"

interface PermissionSettingsModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  user: AdminUser | null
  onSaved?: () => void
}

export function PermissionSettingsModal({
  open,
  onOpenChange,
  user,
  onSaved,
}: PermissionSettingsModalProps) {
  const isMobile = useIsMobile()
  const { data: projects = [], isLoading: projectsLoading } = useProjects()
  const { data: rolesData = [] } = useRoles()
  const updatePermissionsMutation = useUpdateUserPermissions()
  const assignRoleMutation = useAssignRole()
  const revokeRoleMutation = useRevokeRole()

  const [saving, setSaving] = useState(false)

  // Local state for editing
  const [allAccess, setAllAccess] = useState(false)
  const [selectedPartIds, setSelectedPartIds] = useState<number[]>([])
  const [selectedRoles, setSelectedRoles] = useState<string[]>([])
  const [roleError, setRoleError] = useState(false)

  // Get all part IDs from projects
  const allPartIds = projects.flatMap((p: Project) => p.parts.map((pt) => pt.id))

  // Initialize state when user changes
  useEffect(() => {
    if (!open || !user) return

    setRoleError(false)

    const isAdmin = user.roles.includes("admin")
    if (isAdmin) {
      setAllAccess(true)
      setSelectedPartIds(allPartIds)
    } else if (user.authorizedPartIds.length === allPartIds.length && allPartIds.length > 0) {
      setAllAccess(true)
      setSelectedPartIds(allPartIds)
    } else {
      setAllAccess(false)
      setSelectedPartIds([...user.authorizedPartIds])
    }
    setSelectedRoles([...user.roles])
  }, [open, user]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleAllAccessChange = useCallback(
    (checked: boolean) => {
      setAllAccess(checked)
      if (checked) {
        setSelectedPartIds(allPartIds)
      }
    },
    [allPartIds]
  )

  const handleSave = useCallback(async () => {
    if (!user) return

    if (selectedRoles.length === 0) {
      setRoleError(true)
      return
    }

    setSaving(true)
    try {
      // Update part permissions
      const partIds = allAccess ? allPartIds : selectedPartIds
      await updatePermissionsMutation.mutateAsync({
        userId: user.id,
        data: { part_ids: partIds },
      })

      // Sync roles: add new, remove old
      const rolesToAdd = selectedRoles.filter((r) => !user.roles.includes(r))
      const rolesToRemove = user.roles.filter((r) => !selectedRoles.includes(r))

      for (const roleName of rolesToAdd) {
        const role = rolesData.find((rd) => rd.name === roleName)
        if (role) {
          await assignRoleMutation.mutateAsync({ user_id: user.id, role_id: role.id })
        }
      }
      for (const roleName of rolesToRemove) {
        const role = rolesData.find((rd) => rd.name === roleName)
        if (role) {
          await revokeRoleMutation.mutateAsync({ user_id: user.id, role_id: role.id })
        }
      }

      onSaved?.()
      onOpenChange(false)
      toast.success("저장 완료")
    } catch {
      toast.error("저장 실패")
    } finally {
      setSaving(false)
    }
  }, [user, allAccess, selectedPartIds, selectedRoles, allPartIds, updatePermissionsMutation, assignRoleMutation, revokeRoleMutation, rolesData, onSaved, onOpenChange])

  const handleCancel = useCallback(() => {
    if (saving) return
    onOpenChange(false)
  }, [saving, onOpenChange])

  if (!user) return null

  // Build project tree for PartPermissionTree
  const projectTree = projects.map((p: Project) => ({
    id: p.id,
    name: p.name,
    parts: p.parts.map((pt) => ({ id: pt.id, name: pt.name })),
  }))

  const loading = projectsLoading

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
            selectedPartIds={selectedPartIds}
            allAccess={allAccess}
            roles={selectedRoles}
            onAllAccessChange={handleAllAccessChange}
            onPartsChange={setSelectedPartIds}
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
