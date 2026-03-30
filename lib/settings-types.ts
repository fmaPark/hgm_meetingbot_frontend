/**
 * Settings page types – re-exports API types and provides UI helpers
 */
import type {
  Project as ApiProject,
  Part as ApiPart,
  AsanaConfig as ApiAsanaConfig,
} from '@/lib/api/types'

// Re-export API types for direct use in components
export type Project = ApiProject
export type Part = ApiPart
export type AsanaConfig = ApiAsanaConfig

/** Mask a drive folder ID for display (show first 6 chars + "***") */
export function maskDriveId(driveId: string): string {
  if (driveId.length <= 6) return driveId + "***"
  return driveId.slice(0, 6) + "***"
}
