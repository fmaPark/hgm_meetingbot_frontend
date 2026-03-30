'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { meetingsApi } from '@/lib/api'
import type {
  MeetingQueryParams,
  SummarizeRequest,
  TranscribeRequest,
  UpdateSummaryContentRequest,
  UploadSummaryRequest,
} from '@/lib/api/types'

// ─── Query Keys ──────────────────────────────────────────

export const meetingKeys = {
  all: ['meetings'] as const,
  lists: () => [...meetingKeys.all, 'list'] as const,
  list: (params?: MeetingQueryParams) => [...meetingKeys.lists(), params] as const,
  deleted: () => [...meetingKeys.all, 'deleted'] as const,
  summary: (meetingId: string, path: string) =>
    [...meetingKeys.all, 'summary', meetingId, path] as const,
  transcript: (meetingId: string) =>
    [...meetingKeys.all, 'transcript', meetingId] as const,
}

// ─── Queries ─────────────────────────────────────────────

export function useMeetings(params?: MeetingQueryParams, hasProcessingItems = false) {
  return useQuery({
    queryKey: meetingKeys.list(params),
    queryFn: () => meetingsApi.getMeetings(params),
    refetchInterval: hasProcessingItems ? 5_000 : false,
  })
}

export function useDeletedMeetings() {
  return useQuery({
    queryKey: meetingKeys.deleted(),
    queryFn: () => meetingsApi.getDeletedMeetings(),
  })
}

export function useSummaryContent(meetingId: string, path: string, enabled = true) {
  return useQuery({
    queryKey: meetingKeys.summary(meetingId, path),
    queryFn: () => meetingsApi.getSummaryContent(meetingId, path),
    enabled: enabled && !!meetingId && !!path,
  })
}

export function useTranscript(meetingId: string, enabled = true) {
  return useQuery({
    queryKey: meetingKeys.transcript(meetingId),
    queryFn: () => meetingsApi.getTranscript(meetingId),
    enabled: enabled && !!meetingId,
  })
}

// ─── Mutations ───────────────────────────────────────────

export function useDeleteMeeting() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (meetingId: string) => meetingsApi.deleteMeeting(meetingId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: meetingKeys.all })
    },
  })
}

export function useRestoreMeeting() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (meetingId: string) => meetingsApi.restoreMeeting(meetingId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: meetingKeys.all })
    },
  })
}

export function useTranscribeMeeting() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ meetingId, data }: { meetingId: string; data: TranscribeRequest }) =>
      meetingsApi.transcribeMeeting(meetingId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: meetingKeys.lists() })
    },
  })
}

export function useSummarizeMeeting() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ meetingId, data }: { meetingId: string; data: SummarizeRequest }) =>
      meetingsApi.summarizeMeeting(meetingId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: meetingKeys.lists() })
    },
  })
}

export function useUpdateSummaryContent() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ meetingId, data }: { meetingId: string; data: UpdateSummaryContentRequest }) =>
      meetingsApi.updateSummaryContent(meetingId, data),
    onSuccess: (_data, { meetingId, data }) => {
      queryClient.invalidateQueries({
        queryKey: meetingKeys.summary(meetingId, data.path),
      })
    },
  })
}

export function useUploadSummary() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ meetingId, data }: { meetingId: string; data: UploadSummaryRequest }) =>
      meetingsApi.uploadSummary(meetingId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: meetingKeys.lists() })
    },
  })
}
