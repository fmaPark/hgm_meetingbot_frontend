'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { adminApi } from '@/lib/api'
import type {
  DiscordRoleMappingCreate,
  LlmSettingsUpdate,
  PermissionAssignmentRequest,
  PermissionCreate,
  RoleAssignmentRequest,
  RoleCreate,
  UserPermissionsUpdate,
  UserUpdate,
} from '@/lib/api/types'

// ─── Query Keys ──────────────────────────────────────────

export const adminKeys = {
  all: ['admin'] as const,
  users: () => [...adminKeys.all, 'users'] as const,
  roles: () => [...adminKeys.all, 'roles'] as const,
  permissions: () => [...adminKeys.all, 'permissions'] as const,
  llmSettings: () => [...adminKeys.all, 'llm-settings'] as const,
  discordRoles: () => [...adminKeys.all, 'discord-roles'] as const,
}

// ─── User Queries ────────────────────────────────────────

export function useUsers() {
  return useQuery({
    queryKey: adminKeys.users(),
    queryFn: () => adminApi.getAllUsers(),
  })
}

// ─── User Mutations ──────────────────────────────────────

export function useUpdateUser() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ userId, data }: { userId: number; data: UserUpdate }) =>
      adminApi.updateUser(userId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.users() })
    },
  })
}

export function useDeleteUser() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (userId: number) => adminApi.deleteUser(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.users() })
    },
  })
}

export function useUpdateUserPermissions() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ userId, data }: { userId: number; data: UserPermissionsUpdate }) =>
      adminApi.updateUserPermissions(userId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.users() })
    },
  })
}

// ─── RBAC Queries ────────────────────────────────────────

export function useRoles() {
  return useQuery({
    queryKey: adminKeys.roles(),
    queryFn: () => adminApi.getRoles(),
  })
}

export function usePermissions() {
  return useQuery({
    queryKey: adminKeys.permissions(),
    queryFn: () => adminApi.getPermissions(),
  })
}

// ─── RBAC Mutations ──────────────────────────────────────

export function useCreateRole() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: RoleCreate) => adminApi.createRole(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.roles() })
    },
  })
}

export function useCreatePermission() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: PermissionCreate) => adminApi.createPermission(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.permissions() })
    },
  })
}

export function useAssignRole() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: RoleAssignmentRequest) => adminApi.assignRole(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.users() })
      queryClient.invalidateQueries({ queryKey: adminKeys.roles() })
    },
  })
}

export function useRevokeRole() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: RoleAssignmentRequest) => adminApi.revokeRole(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.users() })
      queryClient.invalidateQueries({ queryKey: adminKeys.roles() })
    },
  })
}

export function useAssignPermissionToRole() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: PermissionAssignmentRequest) =>
      adminApi.assignPermissionToRole(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.roles() })
    },
  })
}

export function useRevokePermissionFromRole() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: PermissionAssignmentRequest) =>
      adminApi.revokePermissionFromRole(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.roles() })
    },
  })
}

// ─── LLM Settings ────────────────────────────────────────

export function useLlmSettings() {
  return useQuery({
    queryKey: adminKeys.llmSettings(),
    queryFn: () => adminApi.getLlmSettings(),
  })
}

export function useUpdateLlmSettings() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: LlmSettingsUpdate) => adminApi.updateLlmSettings(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.llmSettings() })
    },
  })
}

// ─── Discord Role Mapping ────────────────────────────────

export function useDiscordRoles() {
  return useQuery({
    queryKey: adminKeys.discordRoles(),
    queryFn: () => adminApi.getDiscordRoles(),
  })
}

export function useCreateDiscordRoleMapping() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: DiscordRoleMappingCreate) =>
      adminApi.createDiscordRoleMapping(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.discordRoles() })
    },
  })
}
