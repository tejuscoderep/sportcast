import type { LiveMatchPersisted } from "@/types"

const LIVE_MATCH_KEY = "sportcast-live-match"

export function saveLiveMatch(data: LiveMatchPersisted): void {
  if (typeof window === "undefined") return
  localStorage.setItem(LIVE_MATCH_KEY, JSON.stringify(data))
}

export function loadLiveMatch(): LiveMatchPersisted | null {
  if (typeof window === "undefined") return null
  try {
    const stored = localStorage.getItem(LIVE_MATCH_KEY)
    return stored ? JSON.parse(stored) : null
  } catch {
    return null
  }
}

export function clearLiveMatch(): void {
  if (typeof window === "undefined") return
  localStorage.removeItem(LIVE_MATCH_KEY)
}
