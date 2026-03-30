'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { promptsApi } from '@/lib/api'
import type { KeywordDataCreate, PromptDataCreate } from '@/lib/api/types'

// ─── Query Keys ──────────────────────────────────────────

export const promptKeys = {
  all: ['prompts'] as const,
  lists: () => [...promptKeys.all, 'list'] as const,
  detail: (id: number) => [...promptKeys.all, 'detail', id] as const,
}

export const keywordKeys = {
  all: ['keywords'] as const,
  lists: () => [...keywordKeys.all, 'list'] as const,
  detail: (id: number) => [...keywordKeys.all, 'detail', id] as const,
}

export const modelKeys = {
  llm: ['models', 'llm'] as const,
  stt: ['models', 'stt'] as const,
}

// ─── Prompt Queries ──────────────────────────────────────

export function usePrompts() {
  return useQuery({
    queryKey: promptKeys.lists(),
    queryFn: () => promptsApi.getPrompts(),
  })
}

export function usePrompt(promptId: number, enabled = true) {
  return useQuery({
    queryKey: promptKeys.detail(promptId),
    queryFn: () => promptsApi.getPrompt(promptId),
    enabled,
  })
}

// ─── Prompt Mutations ────────────────────────────────────

export function useCreatePrompt() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: PromptDataCreate) => promptsApi.createPrompt(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: promptKeys.all })
    },
  })
}

export function useUpdatePrompt() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ promptId, data }: { promptId: number; data: PromptDataCreate }) =>
      promptsApi.updatePrompt(promptId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: promptKeys.all })
    },
  })
}

export function useDeletePrompt() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (promptId: number) => promptsApi.deletePrompt(promptId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: promptKeys.all })
    },
  })
}

// ─── Keyword Queries ─────────────────────────────────────

export function useKeywords() {
  return useQuery({
    queryKey: keywordKeys.lists(),
    queryFn: () => promptsApi.getKeywords(),
  })
}

export function useKeyword(keywordId: number, enabled = true) {
  return useQuery({
    queryKey: keywordKeys.detail(keywordId),
    queryFn: () => promptsApi.getKeyword(keywordId),
    enabled,
  })
}

// ─── Keyword Mutations ───────────────────────────────────

export function useCreateKeyword() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: KeywordDataCreate) => promptsApi.createKeyword(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: keywordKeys.all })
    },
  })
}

export function useUpdateKeyword() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ keywordId, data }: { keywordId: number; data: KeywordDataCreate }) =>
      promptsApi.updateKeyword(keywordId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: keywordKeys.all })
    },
  })
}

export function useDeleteKeyword() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (keywordId: number) => promptsApi.deleteKeyword(keywordId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: keywordKeys.all })
    },
  })
}

// ─── Model Queries ───────────────────────────────────────

export function useLlmModels() {
  return useQuery({
    queryKey: modelKeys.llm,
    queryFn: () => promptsApi.getModels(),
    staleTime: 5 * 60_000,
  })
}

export function useSttModels() {
  return useQuery({
    queryKey: modelKeys.stt,
    queryFn: () => promptsApi.getSttModels(),
    staleTime: 5 * 60_000,
  })
}
