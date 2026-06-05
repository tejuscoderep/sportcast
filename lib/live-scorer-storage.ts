import type { MatchSetupData, ScoringState } from "@/types"

const SETUP_KEY = "sportcast-match-setup"
const SCORING_KEY = "sportcast-scoring-state"

export function saveMatchSetup(data: MatchSetupData): void {
  if (typeof window === "undefined") return
  localStorage.setItem(SETUP_KEY, JSON.stringify(data))
}

export function loadMatchSetup(): MatchSetupData | null {
  if (typeof window === "undefined") return null
  try {
    const stored = localStorage.getItem(SETUP_KEY)
    return stored ? JSON.parse(stored) : null
  } catch {
    return null
  }
}

export function clearMatchSetup(): void {
  if (typeof window === "undefined") return
  localStorage.removeItem(SETUP_KEY)
}

export function saveScoringState(state: ScoringState): void {
  if (typeof window === "undefined") return
  localStorage.setItem(SCORING_KEY, JSON.stringify(state))
}

export function loadScoringState(): ScoringState | null {
  if (typeof window === "undefined") return null
  try {
    const stored = localStorage.getItem(SCORING_KEY)
    return stored ? JSON.parse(stored) : null
  } catch {
    return null
  }
}

export function clearScoringState(): void {
  if (typeof window === "undefined") return
  localStorage.removeItem(SCORING_KEY)
}
