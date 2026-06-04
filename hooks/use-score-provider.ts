"use client"

import { useEffect, useRef } from "react"
import { useDirectorStore } from "@/store"
import { createScoreProvider } from "@/services/playhq"

const scoreProvider = createScoreProvider()

export function useScoreProvider() {
  const setMatchData = useDirectorStore((s) => s.setMatchData)
  const matchData = useDirectorStore((s) => s.matchData)
  const unsubRef = useRef<(() => void) | null>(null)

  useEffect(() => {
    scoreProvider.getMatch().then((data) => {
      setMatchData(data)
    })

    unsubRef.current = scoreProvider.subscribeToScoreUpdates((data) => {
      setMatchData(data)
    })

    return () => {
      unsubRef.current?.()
      unsubRef.current = null
    }
  }, [setMatchData])

  return { matchData }
}
