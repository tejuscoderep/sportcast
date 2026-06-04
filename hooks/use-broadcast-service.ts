"use client"

import { useEffect, useRef, useCallback } from "react"
import { useDirectorStore } from "@/store"
import { createBroadcastService } from "@/services/broadcast"

const broadcastService = createBroadcastService()

export function useBroadcastService() {
  const broadcastState = useDirectorStore((s) => s.broadcastState)
  const setBroadcastState = useDirectorStore((s) => s.setBroadcastState)
  const unsubRef = useRef<(() => void) | null>(null)

  useEffect(() => {
    unsubRef.current = broadcastService.subscribeToStatus((state) => {
      setBroadcastState(state)
    })

    return () => {
      unsubRef.current?.()
      unsubRef.current = null
    }
  }, [setBroadcastState])

  const startBroadcast = useCallback(async () => {
    setBroadcastState({ status: "starting" })
    try {
      await broadcastService.startBroadcast()
    } catch (err) {
      setBroadcastState({ status: "error" })
    }
  }, [setBroadcastState])

  const stopBroadcast = useCallback(async () => {
    setBroadcastState({ status: "stopping" })
    try {
      await broadcastService.stopBroadcast()
    } catch (err) {
      setBroadcastState({ status: "error" })
    }
  }, [setBroadcastState])

  return { broadcastState, startBroadcast, stopBroadcast }
}
