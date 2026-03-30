'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { projectsApi } from '@/lib/api'
import type {
  AsanaConfig,
  AsanaConfigRequest,
  PartCreate,
  PartUpdate,
  ProjectCreate,
} from '@/lib/api/types'

// ─── Query Keys ──────────────────────────────────────────

export const projectKeys = {
  all: ['projects'] as const,
  lists: () => [...projectKeys.all, 'list'] as const,
  part: (partId: number) => [...projectKeys.all, 'part', partId] as const,
}

// ─── Queries ─────────────────────────────────────────────

export function useProjects() {
  return useQuery({
    queryKey: projectKeys.lists(),
    queryFn: () => projectsApi.getProjects(),
  })
}

// ─── Mutations ───────────────────────────────────────────

export function useCreateProject() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: ProjectCreate) => projectsApi.createProject(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: projectKeys.all })
    },
  })
}

export function useUpdateProject() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ projectId, data }: { projectId: number; data: ProjectCreate }) =>
      projectsApi.updateProject(projectId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: projectKeys.all })
    },
  })
}

export function useDeleteProject() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (projectId: number) => projectsApi.deleteProject(projectId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: projectKeys.all })
    },
  })
}

export function useAddPart() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ projectName, data }: { projectName: string; data: PartCreate }) =>
      projectsApi.addPart(projectName, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: projectKeys.all })
    },
  })
}

export function useUpdatePart() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ partId, data }: { partId: number; data: PartUpdate }) =>
      projectsApi.updatePart(partId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: projectKeys.all })
    },
  })
}

export function useDeletePart() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (partId: number) => projectsApi.deletePart(partId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: projectKeys.all })
    },
  })
}

export function useUpdateAsanaConfig() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ partId, data }: { partId: number; data: AsanaConfig }) =>
      projectsApi.updateAsanaConfig(partId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: projectKeys.all })
    },
  })
}

export function useAsanaConfigFromUrl() {
  return useMutation({
    mutationFn: (data: AsanaConfigRequest) =>
      projectsApi.getAsanaConfigFromUrl(data),
  })
}
