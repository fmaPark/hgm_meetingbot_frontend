/**
 * LLM API Key management types
 * Used by the system settings panel for API key display
 */

export interface LlmKeyStatus {
  provider: string
  providerId: "openai" | "gemini"
  isSet: boolean
}

export interface AvailableProvider {
  id: "openai" | "gemini"
  name: string
}

export const AVAILABLE_PROVIDERS: AvailableProvider[] = [
  { id: "openai", name: "OpenAI" },
  { id: "gemini", name: "Google (Gemini)" },
]

/** Validate API key format (non-empty, min 8 chars) */
export function isValidApiKey(key: string): boolean {
  return key.trim().length >= 8
}
