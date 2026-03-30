"use client"

import { useState, useCallback, useEffect } from "react"
import { toast } from "sonner"
import { AppLayout } from "@/components/app-layout"
import { useIsMobile } from "@/hooks/use-mobile"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { ProjectListPanel } from "@/components/settings/project-list-panel"
import { PartListPanel } from "@/components/settings/part-list-panel"
import { PartEditModal } from "@/components/settings/part-edit-modal"
import { AsanaSettingsModal } from "@/components/settings/asana-settings-modal"
import { PromptManagementPanel } from "@/components/settings/prompt-management-panel"
import { KeywordManagementPanel } from "@/components/settings/keyword-management-panel"
import { ConfirmDialog } from "@/components/confirm-dialog"
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog"
import type { Project, Part, AsanaConfig } from "@/lib/settings-types"
import {
  useProjects,
  useCreateProject,
  useUpdateProject,
  useDeleteProject,
  useAddPart,
  useUpdatePart,
  useDeletePart,
  useUpdateAsanaConfig,
  useAsanaConfigFromUrl,
} from "@/lib/hooks/use-projects"

type DeleteTarget =
  | { type: "project"; project: Project }
  | { type: "part"; part: Part }

export default function SettingsProjectsPage() {
  const isMobile = useIsMobile()

  // ─── API Data ──────────────────────────────────────
  const { data: projects = [], isLoading: loading } = useProjects()

  // ─── Mutations ─────────────────────────────────────
  const createProjectMutation = useCreateProject()
  const updateProjectMutation = useUpdateProject()
  const deleteProjectMutation = useDeleteProject()
  const addPartMutation = useAddPart()
  const updatePartMutation = useUpdatePart()
  const deletePartMutation = useDeletePart()
  const updateAsanaConfigMutation = useUpdateAsanaConfig()
  const asanaConfigFromUrlMutation = useAsanaConfigFromUrl()

  // Selection state
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)

  // Mobile drill-down state
  const [mobileView, setMobileView] = useState<"projects" | "parts">("projects")

  // Part modal state
  const [partModalOpen, setPartModalOpen] = useState(false)
  const [editingPart, setEditingPart] = useState<Part | null>(null)

  // Asana modal state
  const [asanaModalOpen, setAsanaModalOpen] = useState(false)
  const [asanaPart, setAsanaPart] = useState<Part | null>(null)

  // Delete dialog state
  const [deleteTarget, setDeleteTarget] = useState<DeleteTarget | null>(null)

  // "Cannot delete" info dialog
  const [cannotDeleteMsg, setCannotDeleteMsg] = useState<string | null>(null)

  // Sync selectedProject with fresh data after mutations
  useEffect(() => {
    if (selectedProject && projects.length > 0) {
      const fresh = projects.find((p) => p.id === selectedProject.id)
      if (fresh) {
        setSelectedProject(fresh)
      } else {
        setSelectedProject(null)
      }
    }
  }, [projects]) // eslint-disable-line react-hooks/exhaustive-deps

  // Mobile browser back
  useEffect(() => {
    if (!isMobile) return

    function handlePopState() {
      if (mobileView === "parts") {
        setMobileView("projects")
      }
    }
    window.addEventListener("popstate", handlePopState)
    return () => window.removeEventListener("popstate", handlePopState)
  }, [isMobile, mobileView])

  // ─── Project Handlers ────────────────────────────────

  const handleSelectProject = useCallback(
    (project: Project) => {
      setSelectedProject(project)

      if (isMobile) {
        window.history.pushState({ view: "parts" }, "")
        setMobileView("parts")
      }
    },
    [isMobile]
  )

  const handleAddProject = useCallback(
    (name: string) => {
      createProjectMutation.mutate(
        { name },
        {
          onSuccess: () => toast.success("프로젝트 생성 완료"),
          onError: () => toast.error("프로젝트 생성 실패"),
        }
      )
    },
    [createProjectMutation]
  )

  const handleRenameProject = useCallback(
    (id: number, name: string) => {
      updateProjectMutation.mutate(
        { projectId: id, data: { name } },
        {
          onSuccess: () => toast.success("프로젝트 이름 변경 완료"),
          onError: () => toast.error("이름 변경 실패"),
        }
      )
    },
    [updateProjectMutation]
  )

  const handleDeleteProjectRequest = useCallback(
    (project: Project) => {
      if (project.parts.length > 0) {
        setCannotDeleteMsg(
          `하위 파트가 ${project.parts.length}개 있어 삭제할 수 없습니다. 파트를 먼저 삭제해주세요.`
        )
        return
      }
      setDeleteTarget({ type: "project", project })
    },
    []
  )

  const handleDeleteProjectConfirm = useCallback(() => {
    if (deleteTarget?.type !== "project") return
    const projectId = deleteTarget.project.id

    deleteProjectMutation.mutate(projectId, {
      onSuccess: () => {
        if (selectedProject?.id === projectId) {
          setSelectedProject(null)
        }
        setDeleteTarget(null)
        toast.success("프로젝트 삭제 완료")
      },
      onError: () => toast.error("프로젝트 삭제 실패"),
    })
  }, [deleteTarget, selectedProject, deleteProjectMutation])

  // ─── Part Handlers ────────────────────────────────

  const handleOpenAddPart = useCallback(() => {
    setEditingPart(null)
    setPartModalOpen(true)
  }, [])

  const handleOpenEditPart = useCallback((part: Part) => {
    setEditingPart(part)
    setPartModalOpen(true)
  }, [])

  const handleSavePart = useCallback(
    (data: { name: string; drive_folder_id: string }) => {
      if (!selectedProject) return

      if (editingPart) {
        // Update existing part
        updatePartMutation.mutate(
          {
            partId: editingPart.id,
            data: {
              name: data.name,
              drive_folder_id: data.drive_folder_id || null,
            },
          },
          {
            onSuccess: () => {
              setPartModalOpen(false)
              setEditingPart(null)
              toast.success("파트 수정 완료")
            },
            onError: () => toast.error("파트 수정 실패"),
          }
        )
      } else {
        // Add new part
        addPartMutation.mutate(
          {
            projectName: selectedProject.name,
            data: {
              name: data.name,
              drive_folder_id: data.drive_folder_id || null,
            },
          },
          {
            onSuccess: () => {
              setPartModalOpen(false)
              setEditingPart(null)
              toast.success("파트 생성 완료")
            },
            onError: () => toast.error("파트 생성 실패"),
          }
        )
      }
    },
    [selectedProject, editingPart, updatePartMutation, addPartMutation]
  )

  const handleDeletePartRequest = useCallback((part: Part) => {
    setDeleteTarget({ type: "part", part })
  }, [])

  const handleDeletePartConfirm = useCallback(() => {
    if (deleteTarget?.type !== "part") return
    const partId = deleteTarget.part.id

    deletePartMutation.mutate(partId, {
      onSuccess: () => {
        setDeleteTarget(null)
        toast.success("파트 삭제 완료")
      },
      onError: () => toast.error("파트 삭제 실패"),
    })
  }, [deleteTarget, deletePartMutation])

  const handleOpenAsana = useCallback((part: Part) => {
    setAsanaPart(part)
    setAsanaModalOpen(true)
  }, [])

  const handleSaveAsana = useCallback(
    (partId: number, config: AsanaConfig) => {
      updateAsanaConfigMutation.mutate(
        { partId, data: config },
        {
          onSuccess: () => {
            setAsanaModalOpen(false)
            setAsanaPart(null)
            toast.success("Asana 설정 저장 완료")
          },
          onError: () => toast.error("Asana 설정 저장 실패"),
        }
      )
    },
    [updateAsanaConfigMutation]
  )

  const handleFetchAsanaFromUrl = useCallback(
    async (url: string, fieldName: string, enumName: string, driveFieldName: string) => {
      return asanaConfigFromUrlMutation.mutateAsync({
        url,
        field_name: fieldName,
        enum_name: enumName,
        drive_field_name: driveFieldName,
      })
    },
    [asanaConfigFromUrlMutation]
  )

  const handleMobileBack = useCallback(() => {
    setMobileView("projects")
  }, [])

  // ─── Current parts for selected project ────────────────
  const currentParts = selectedProject?.parts ?? []

  // ─── Delete dialog label helpers ────────────────
  const deleteDialogTitle =
    deleteTarget?.type === "project" ? "프로젝트 삭제" : "파트 삭제"
  const deleteDialogDesc =
    deleteTarget?.type === "project"
      ? `${deleteTarget.project.name}을(를) 삭제하시겠습니까?`
      : deleteTarget?.type === "part"
        ? `${deleteTarget.part.name}을(를) 삭제하시겠습니까?`
        : ""

  const deleteLoading =
    deleteProjectMutation.isPending || deletePartMutation.isPending

  return (
    <AppLayout>
      <main>
        {/* Settings Tab Bar */}
        <Tabs defaultValue="projects" className="w-full gap-0">
          <div className="sticky top-0 z-40 flex h-[65px] items-center border-b border-border bg-card">
            <TabsList className="mx-4 h-[64px] w-auto rounded-none bg-transparent p-0">
              <TabsTrigger
                value="projects"
                className="relative h-[64px] rounded-none border-b-2 border-transparent bg-transparent px-4 text-sm font-medium text-text-secondary shadow-none data-[state=active]:border-b-brand-green data-[state=active]:bg-transparent data-[state=active]:text-foreground data-[state=active]:shadow-none"
              >
                프로젝트 및 파트
              </TabsTrigger>
              <TabsTrigger
                value="prompts"
                className="relative h-[64px] rounded-none border-b-2 border-transparent bg-transparent px-4 text-sm font-medium text-text-secondary shadow-none data-[state=active]:border-b-brand-green data-[state=active]:bg-transparent data-[state=active]:text-foreground data-[state=active]:shadow-none"
              >
                프롬프트 및 키워드
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="projects" className="mt-0">
            {/* Desktop: split panel */}
            {!isMobile ? (
              <div className="flex min-h-[calc(100vh-65px)]">
                {/* Left: Project List (35%) */}
                <div className="w-[35%] border-r border-border bg-card">
                  <ProjectListPanel
                    projects={projects}
                    selectedId={selectedProject?.id ?? null}
                    onSelect={handleSelectProject}
                    onAdd={handleAddProject}
                    onRename={handleRenameProject}
                    onDelete={handleDeleteProjectRequest}
                    loading={loading}
                  />
                </div>

                {/* Right: Part List (65%) */}
                <div className="flex-1 bg-card">
                  <PartListPanel
                    project={selectedProject}
                    parts={currentParts}
                    onAddPart={handleOpenAddPart}
                    onEditPart={handleOpenEditPart}
                    onDeletePart={handleDeletePartRequest}
                    onAsanaSettings={handleOpenAsana}
                  />
                </div>
              </div>
            ) : (
              /* Mobile: drill-down */
              <div className="relative min-h-[calc(100vh-65px)] overflow-hidden">
                {/* 1depth: Project list */}
                <div
                  className={`absolute inset-0 bg-card transition-transform duration-300 ${
                    mobileView === "parts"
                      ? "-translate-x-full"
                      : "translate-x-0"
                  }`}
                >
                  <ProjectListPanel
                    projects={projects}
                    selectedId={null}
                    onSelect={handleSelectProject}
                    onAdd={handleAddProject}
                    onRename={handleRenameProject}
                    onDelete={handleDeleteProjectRequest}
                    loading={loading}
                    isMobile
                  />
                </div>

                {/* 2depth: Part list */}
                <div
                  className={`absolute inset-0 bg-card transition-transform duration-300 ${
                    mobileView === "parts"
                      ? "translate-x-0"
                      : "translate-x-full"
                  }`}
                >
                  <PartListPanel
                    project={selectedProject}
                    parts={currentParts}
                    onBack={handleMobileBack}
                    onAddPart={handleOpenAddPart}
                    onEditPart={handleOpenEditPart}
                    onDeletePart={handleDeletePartRequest}
                    onAsanaSettings={handleOpenAsana}
                    isMobile
                  />
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="prompts" className="mt-0">
            {/* Desktop: 50/50 split panel */}
            {!isMobile ? (
              <div className="flex min-h-[calc(100vh-65px)]">
                <div className="w-1/2 overflow-y-auto border-r border-border bg-card">
                  <PromptManagementPanel />
                </div>
                <div className="w-1/2 overflow-y-auto bg-card">
                  <KeywordManagementPanel />
                </div>
              </div>
            ) : (
              /* Mobile: sub-tabs */
              <PromptKeywordMobileTabs />
            )}
          </TabsContent>
        </Tabs>
      </main>

      {/* Part Add/Edit Modal */}
      <PartEditModal
        open={partModalOpen}
        onOpenChange={(open) => {
          if (!open) {
            setPartModalOpen(false)
            setEditingPart(null)
          }
        }}
        part={editingPart}
        onSave={handleSavePart}
      />

      {/* Asana Settings Modal */}
      <AsanaSettingsModal
        open={asanaModalOpen}
        onOpenChange={(open) => {
          if (!open) {
            setAsanaModalOpen(false)
            setAsanaPart(null)
          }
        }}
        part={asanaPart}
        onSave={handleSaveAsana}
        onFetchFromUrl={handleFetchAsanaFromUrl}
        fetching={asanaConfigFromUrlMutation.isPending}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null)
        }}
        title={deleteDialogTitle}
        description={deleteDialogDesc}
        confirmText="삭제"
        cancelText="취소"
        variant="destructive"
        loading={deleteLoading}
        onConfirm={
          deleteTarget?.type === "project"
            ? handleDeleteProjectConfirm
            : handleDeletePartConfirm
        }
        onCancel={() => setDeleteTarget(null)}
      />

      {/* "Cannot Delete" Info Dialog */}
      <AlertDialog
        open={cannotDeleteMsg !== null}
        onOpenChange={(open) => {
          if (!open) setCannotDeleteMsg(null)
        }}
      >
        <AlertDialogContent className="max-w-[400px] p-6">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-lg font-semibold text-foreground">
              삭제할 수 없음
            </AlertDialogTitle>
            <AlertDialogDescription className="mt-2 text-sm text-text-secondary">
              {cannotDeleteMsg}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="mt-0">확인</AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AppLayout>
  )
}

/** Mobile sub-tabs for prompt/keyword panels */
function PromptKeywordMobileTabs() {
  return (
    <Tabs defaultValue="prompt" className="w-full gap-0">
      <div className="border-b border-border bg-card px-4">
        <TabsList className="h-10 w-full rounded-none bg-transparent p-0">
          <TabsTrigger
            value="prompt"
            className="flex-1 rounded-none border-b-2 border-transparent bg-transparent text-sm font-medium text-text-secondary shadow-none data-[state=active]:border-b-brand-green data-[state=active]:bg-transparent data-[state=active]:text-foreground data-[state=active]:shadow-none"
          >
            프롬프트
          </TabsTrigger>
          <TabsTrigger
            value="keyword"
            className="flex-1 rounded-none border-b-2 border-transparent bg-transparent text-sm font-medium text-text-secondary shadow-none data-[state=active]:border-b-brand-green data-[state=active]:bg-transparent data-[state=active]:text-foreground data-[state=active]:shadow-none"
          >
            키워드
          </TabsTrigger>
        </TabsList>
      </div>
      <TabsContent value="prompt" className="mt-0 bg-card">
        <PromptManagementPanel />
      </TabsContent>
      <TabsContent value="keyword" className="mt-0 bg-card">
        <KeywordManagementPanel />
      </TabsContent>
    </Tabs>
  )
}
