"use client"

import { useState, useCallback, useEffect, useRef } from "react"
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
import { SAMPLE_PROJECTS, SAMPLE_PARTS } from "@/lib/settings-types"
import type { Prompt, KeywordSet } from "@/lib/prompt-keyword-types"
import {
  SAMPLE_PROMPTS,
  SAMPLE_KEYWORD_SETS,
} from "@/lib/prompt-keyword-types"

type DeleteTarget =
  | { type: "project"; project: Project }
  | { type: "part"; part: Part }

/** Mobile sub-tabs for prompt/keyword panels */
function PromptKeywordMobileTabs({
  prompts,
  onPromptsChange,
  keywordSets,
  onKeywordSetsChange,
  loading,
}: {
  prompts: Prompt[]
  onPromptsChange: (p: Prompt[]) => void
  keywordSets: KeywordSet[]
  onKeywordSetsChange: (k: KeywordSet[]) => void
  loading: boolean
}) {
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
        <PromptManagementPanel
          prompts={prompts}
          onPromptsChange={onPromptsChange}
          loading={loading}
        />
      </TabsContent>
      <TabsContent value="keyword" className="mt-0 bg-card">
        <KeywordManagementPanel
          keywordSets={keywordSets}
          onKeywordSetsChange={onKeywordSetsChange}
          loading={loading}
        />
      </TabsContent>
    </Tabs>
  )
}

export default function SettingsProjectsPage() {
  const isMobile = useIsMobile()

  // Data state
  const [projects, setProjects] = useState<Project[]>([])
  const [partsMap, setPartsMap] = useState<Record<number, Part[]>>({})
  const [loading, setLoading] = useState(true)
  const [partsLoading, setPartsLoading] = useState(false)

  // Prompt & Keyword state
  const [prompts, setPrompts] = useState<Prompt[]>([])
  const [keywordSets, setKeywordSets] = useState<KeywordSet[]>([])
  const [promptsLoading, setPromptsLoading] = useState(true)

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
  const [deleteLoading, setDeleteLoading] = useState(false)

  // "Cannot delete" info dialog
  const [cannotDeleteMsg, setCannotDeleteMsg] = useState<string | null>(null)

  // Next ID counters
  const nextProjectId = useRef(100)
  const nextPartId = useRef(100)

  // Load sample data
  useEffect(() => {
    const timer = setTimeout(() => {
      setProjects(SAMPLE_PROJECTS)
      setPartsMap(SAMPLE_PARTS)
      setLoading(false)
      setPrompts(SAMPLE_PROMPTS)
      setKeywordSets(SAMPLE_KEYWORD_SETS)
      setPromptsLoading(false)
    }, 600)
    return () => clearTimeout(timer)
  }, [])

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
      setPartsLoading(true)

      // Simulate loading parts
      setTimeout(() => {
        setPartsLoading(false)
      }, 300)

      if (isMobile) {
        // Push state for back navigation
        window.history.pushState({ view: "parts" }, "")
        setMobileView("parts")
      }
    },
    [isMobile]
  )

  const handleAddProject = useCallback(
    (name: string) => {
      const id = nextProjectId.current++
      const newProject: Project = { id, name, partCount: 0 }
      setProjects((prev) => [...prev, newProject])
      setPartsMap((prev) => ({ ...prev, [id]: [] }))
      toast.success("프로젝트 생성 완료")
    },
    []
  )

  const handleRenameProject = useCallback(
    (id: number, name: string) => {
      setProjects((prev) =>
        prev.map((p) => (p.id === id ? { ...p, name } : p))
      )
      if (selectedProject?.id === id) {
        setSelectedProject((prev) => (prev ? { ...prev, name } : prev))
      }
      toast.success("프로젝트 이름 변경 완료")
    },
    [selectedProject]
  )

  const handleDeleteProjectRequest = useCallback(
    (project: Project) => {
      const partCount = partsMap[project.id]?.length ?? 0
      if (partCount > 0) {
        setCannotDeleteMsg(
          `하위 파트가 ${partCount}개 있어 삭제할 수 없습니다. 파트를 먼저 삭제해주세요.`
        )
        return
      }
      setDeleteTarget({ type: "project", project })
    },
    [partsMap]
  )

  const handleDeleteProjectConfirm = useCallback(() => {
    if (deleteTarget?.type !== "project") return
    setDeleteLoading(true)
    const projectId = deleteTarget.project.id

    setTimeout(() => {
      setProjects((prev) => prev.filter((p) => p.id !== projectId))
      setPartsMap((prev) => {
        const copy = { ...prev }
        delete copy[projectId]
        return copy
      })
      if (selectedProject?.id === projectId) {
        setSelectedProject(null)
      }
      setDeleteTarget(null)
      setDeleteLoading(false)
      toast.success("프로젝트 삭제 완료")
    }, 500)
  }, [deleteTarget, selectedProject])

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
    (data: { name: string; driveId: string }) => {
      if (!selectedProject) return

      if (editingPart) {
        // Update existing part
        setPartsMap((prev) => ({
          ...prev,
          [selectedProject.id]: (prev[selectedProject.id] ?? []).map((p) =>
            p.id === editingPart.id
              ? {
                  ...p,
                  name: data.name,
                  driveId: data.driveId,
                  driveConnected: data.driveId.trim() !== "",
                }
              : p
          ),
        }))
        toast.success("파트 수정 완료")
      } else {
        // Add new part
        const id = nextPartId.current++
        const newPart: Part = {
          id,
          projectId: selectedProject.id,
          name: data.name,
          driveId: data.driveId || null,
          driveConnected: data.driveId.trim() !== "",
          asanaConfigured: false,
        }
        setPartsMap((prev) => ({
          ...prev,
          [selectedProject.id]: [...(prev[selectedProject.id] ?? []), newPart],
        }))
        // Update partCount
        setProjects((prev) =>
          prev.map((p) =>
            p.id === selectedProject.id
              ? { ...p, partCount: p.partCount + 1 }
              : p
          )
        )
        setSelectedProject((prev) =>
          prev ? { ...prev, partCount: prev.partCount + 1 } : prev
        )
        toast.success("파트 생성 완료")
      }

      setPartModalOpen(false)
      setEditingPart(null)
    },
    [selectedProject, editingPart]
  )

  const handleDeletePartRequest = useCallback((part: Part) => {
    // For demo, we simulate: parts with id <= 3 "have meetings"
    if (part.id <= 2) {
      const meetingCount = part.id === 1 ? 5 : 3
      setCannotDeleteMsg(
        `해당 파트에 회의 기록이 ${meetingCount}개 있어 삭제할 수 없습니다.`
      )
      return
    }
    setDeleteTarget({ type: "part", part })
  }, [])

  const handleDeletePartConfirm = useCallback(() => {
    if (deleteTarget?.type !== "part" || !selectedProject) return
    setDeleteLoading(true)
    const partId = deleteTarget.part.id

    setTimeout(() => {
      setPartsMap((prev) => ({
        ...prev,
        [selectedProject.id]: (prev[selectedProject.id] ?? []).filter(
          (p) => p.id !== partId
        ),
      }))
      setProjects((prev) =>
        prev.map((p) =>
          p.id === selectedProject.id
            ? { ...p, partCount: Math.max(0, p.partCount - 1) }
            : p
        )
      )
      setSelectedProject((prev) =>
        prev ? { ...prev, partCount: Math.max(0, prev.partCount - 1) } : prev
      )
      setDeleteTarget(null)
      setDeleteLoading(false)
      toast.success("파트 삭제 완료")
    }, 500)
  }, [deleteTarget, selectedProject])

  const handleOpenAsana = useCallback((part: Part) => {
    setAsanaPart(part)
    setAsanaModalOpen(true)
  }, [])

  const handleSaveAsana = useCallback(
    (partId: number, config: AsanaConfig) => {
      if (!selectedProject) return

      setPartsMap((prev) => ({
        ...prev,
        [selectedProject.id]: (prev[selectedProject.id] ?? []).map((p) =>
          p.id === partId
            ? {
                ...p,
                asanaConfigured: !!config.projectId,
                asanaConfig: {
                  ...config,
                  projectName: config.projectId
                    ? `Project-${config.projectId.slice(0, 5)}`
                    : undefined,
                  sectionName: config.sectionId
                    ? `Section-${config.sectionId.slice(0, 5)}`
                    : undefined,
                },
              }
            : p
        ),
      }))
      setAsanaModalOpen(false)
      setAsanaPart(null)
      toast.success("Asana 설정 저장 완료")
    },
    [selectedProject]
  )

  const handleMobileBack = useCallback(() => {
    setMobileView("projects")
  }, [])

  // ─── Current parts for selected project ────────────────

  const currentParts = selectedProject
    ? partsMap[selectedProject.id] ?? []
    : []

  // ─── Delete dialog label helpers ────────────────

  const deleteDialogTitle =
    deleteTarget?.type === "project" ? "프로젝트 삭제" : "파트 삭제"
  const deleteDialogDesc =
    deleteTarget?.type === "project"
      ? `${deleteTarget.project.name}을(를) 삭제하시겠습니까?`
      : deleteTarget?.type === "part"
        ? `${deleteTarget.part.name}을(를) 삭제하시겠습니까?`
        : ""

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
                    loading={partsLoading}
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
                    loading={partsLoading}
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
                  <PromptManagementPanel
                    prompts={prompts}
                    onPromptsChange={setPrompts}
                    loading={promptsLoading}
                  />
                </div>
                <div className="w-1/2 overflow-y-auto bg-card">
                  <KeywordManagementPanel
                    keywordSets={keywordSets}
                    onKeywordSetsChange={setKeywordSets}
                    loading={promptsLoading}
                  />
                </div>
              </div>
            ) : (
              /* Mobile: sub-tabs */
              <PromptKeywordMobileTabs
                prompts={prompts}
                onPromptsChange={setPrompts}
                keywordSets={keywordSets}
                onKeywordSetsChange={setKeywordSets}
                loading={promptsLoading}
              />
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
