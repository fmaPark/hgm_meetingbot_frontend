// Settings page types and sample data for project & part management

export interface Project {
  id: number
  name: string
  partCount: number
}

export interface AsanaConfig {
  url?: string
  workspaceId?: string
  projectId?: string
  sectionId?: string
  projectName?: string
  sectionName?: string
}

export interface Part {
  id: number
  projectId: number
  name: string
  driveId: string | null
  driveConnected: boolean
  asanaConfigured: boolean
  asanaConfig?: AsanaConfig
}

// Sample data
export const SAMPLE_PROJECTS: Project[] = [
  { id: 1, name: "프로젝트 A", partCount: 3 },
  { id: 2, name: "프로젝트 B", partCount: 2 },
  { id: 3, name: "프로젝트 C", partCount: 0 },
]

export const SAMPLE_PARTS: Record<number, Part[]> = {
  1: [
    {
      id: 1,
      projectId: 1,
      name: "기획파트",
      driveId: "abc123xyz",
      driveConnected: true,
      asanaConfigured: true,
      asanaConfig: {
        url: "https://app.asana.com/0/12345/67890",
        workspaceId: "ws-001",
        projectId: "proj-001",
        sectionId: "sec-001",
        projectName: "Marketing",
        sectionName: "Sprint 1",
      },
    },
    {
      id: 2,
      projectId: 1,
      name: "개발파트",
      driveId: "def456uvw",
      driveConnected: true,
      asanaConfigured: false,
    },
    {
      id: 3,
      projectId: 1,
      name: "디자인파트",
      driveId: null,
      driveConnected: false,
      asanaConfigured: false,
    },
  ],
  2: [
    {
      id: 4,
      projectId: 2,
      name: "QA파트",
      driveId: "ghi789rst",
      driveConnected: true,
      asanaConfigured: true,
      asanaConfig: {
        url: "https://app.asana.com/0/11111/22222",
        workspaceId: "ws-002",
        projectId: "proj-002",
        sectionId: "sec-002",
        projectName: "QA Board",
        sectionName: "Review",
      },
    },
    {
      id: 5,
      projectId: 2,
      name: "운영파트",
      driveId: null,
      driveConnected: false,
      asanaConfigured: false,
    },
  ],
  3: [],
}

/** Mask a drive folder ID for display (show first 6 chars + "***") */
export function maskDriveId(driveId: string): string {
  if (driveId.length <= 6) return driveId + "***"
  return driveId.slice(0, 6) + "***"
}

/** Parse an Asana URL to extract workspace, project, and section IDs */
export function parseAsanaUrl(url: string): {
  workspaceId?: string
  projectId?: string
  sectionId?: string
} {
  // Example: https://app.asana.com/0/{projectId}/{taskOrSectionId}
  try {
    const urlObj = new URL(url)
    const parts = urlObj.pathname.split("/").filter(Boolean)
    // parts: ["0", projectId, sectionId?]
    return {
      workspaceId: parts[0] || undefined,
      projectId: parts[1] || undefined,
      sectionId: parts[2] || undefined,
    }
  } catch {
    return {}
  }
}
