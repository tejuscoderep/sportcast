"use client"

import { useCallback } from "react"
import { useDirectorStore } from "@/store"
import * as playhqService from "@/services/playhq/index"
import type { PlayHQConnectionFormValues } from "@/lib/schemas/playHQConnectionSchema"

export function usePlayHQConnection() {
  const setConnectionStatus = useDirectorStore((s) => s.setPlayHQConnectionStatus)
  const setConnected = useDirectorStore((s) => s.setPlayHQConnected)
  const setDisconnected = useDirectorStore((s) => s.setPlayHQDisconnected)
  const setLiveMatches = useDirectorStore((s) => s.setPlayHQLiveMatches)
  const setSelectedMatchId = useDirectorStore((s) => s.setPlayHQSelectedMatchId)
  const setScorecard = useDirectorStore((s) => s.setPlayHQScorecard)

  const handleConnect = useCallback(async (values: PlayHQConnectionFormValues) => {
    setConnectionStatus("connecting")

    try {
      const result = await playhqService.connect({
        tenant: values.tenant,
        clientId: values.clientId,
        clientSecret: values.clientSecret,
        organisationId: values.organisationId,
      })

      if (!result.connected) {
        setConnectionStatus("error")
        return { success: false, error: result.error ?? "Connection failed" }
      }

      setConnected(result.tenant ?? values.tenant, result.organisationId ?? values.organisationId)

      // Fetch live matches after successful connection
      const matches = await playhqService.getLiveMatches()
      setLiveMatches(matches)

      if (matches.length === 1) {
        // Auto-select single match
        setSelectedMatchId(matches[0].id)
        const scorecard = await playhqService.getScorecard(matches[0].id)
        setScorecard(scorecard)
      } else if (matches.length > 1) {
        // Auto-select first match
        setSelectedMatchId(matches[0].id)
        const scorecard = await playhqService.getScorecard(matches[0].id)
        setScorecard(scorecard)
      } else {
        setSelectedMatchId(null)
        setScorecard(null)
      }

      return { success: true }
    } catch {
      setConnectionStatus("error")
      return { success: false, error: "An unexpected error occurred" }
    }
  }, [setConnectionStatus, setConnected, setLiveMatches, setSelectedMatchId, setScorecard])

  const disconnect = useCallback(() => {
    setDisconnected()
  }, [setDisconnected])

  const selectMatch = useCallback(async (matchId: string) => {
    setSelectedMatchId(matchId)
    const scorecard = await playhqService.getScorecard(matchId)
    setScorecard(scorecard)
  }, [setSelectedMatchId, setScorecard])

  return { handleConnect, disconnect, selectMatch }
}
