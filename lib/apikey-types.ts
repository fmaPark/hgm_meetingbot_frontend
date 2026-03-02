/** LLM API Key management types and sample data */

export interface ApiKeyEntry {
  id: number
  provider: string
  providerId: string
  maskedKey: string
  registeredAt: string // YYYY-MM-DD
}

export interface AvailableProvider {
  id: string
  name: string
  keyPrefix: string // e.g. "sk-" for OpenAI
}

export const AVAILABLE_PROVIDERS: AvailableProvider[] = [
  { id: "openai", name: "OpenAI", keyPrefix: "sk-" },
  { id: "gemini", name: "Google (Gemini)", keyPrefix: "AI-" },
]

export const SAMPLE_API_KEYS: ApiKeyEntry[] = [
  {
    id: 1,
    provider: "OpenAI",
    providerId: "openai",
    maskedKey: "sk-****************************1234",
    registeredAt: "2026-02-10",
  },
  {
    id: 2,
    provider: "Google (Gemini)",
    providerId: "gemini",
    maskedKey: "AI-****************************5678",
    registeredAt: "2026-02-15",
  },
]

/** Mask an API key showing only prefix and last 4 chars */
export function maskApiKey(key: string): string {
  if (key.length <= 8) return key
  const prefix = key.slice(0, 3)
  const suffix = key.slice(-4)
  return `${prefix}${"*".repeat(28)}${suffix}`
}

/** Validate API key format (non-empty, min 8 chars) */
export function isValidApiKey(key: string): boolean {
  return key.trim().length >= 8
}

/** Get today's date in YYYY-MM-DD format */
export function getTodayString(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`
}

/** Get unregistered providers */
export function getUnregisteredProviders(
  registeredProviderIds: string[]
): AvailableProvider[] {
  return AVAILABLE_PROVIDERS.filter(
    (p) => !registeredProviderIds.includes(p.id)
  )
}
