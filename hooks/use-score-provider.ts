"use client"

import { useEffect, useRef } from "react"
import { useDirectorStore } from "@/store"
import { createScoreProvider } from "@/services/playhq"

const scoreProvider = createScoreProvider()

export function useScoreProvider() {
  const setMatchData = useDirectorStore((s) => s.setMatchData)
  const setMatches = useDirectorStore((s) => s.setMatches)
  const setSelectedMatchId = useDirectorStore((s) => s.setSelectedMatchId)
  const selectedMatchId = useDirectorStore((s) => s.selectedMatchId)
  const matchData = useDirectorStore((s) => s.matchData)
  const unsubRef = useRef<(() => void) | null>(null)

  useEffect(() => {
    const liveMatches = scoreProvider.getMatches()
    setMatches(liveMatches)

    if (!selectedMatchId && liveMatches.length > 0) {
      setSelectedMatchId(liveMatches[0].id)
      setMatchData(liveMatches[0].data)
    }

    unsubRef.current = scoreProvider.subscribeToAllUpdates((updatedMatches) => {
      setMatches(updatedMatches)
      if (selectedMatchId) {
        const current = updatedMatches.find((m) => m.id === selectedMatchId)
        if (current) setMatchData(current.data)
      } else if (updatedMatches.length > 0) {
        setMatchData(updatedMatches[0].data)
      }
    })

    return () => {
      unsubRef.current?.()
      unsubRef.current = null
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return { matchData }
}
