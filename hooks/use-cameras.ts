"use client"

import { useEffect, useCallback } from "react"
import { useDirectorStore } from "@/store"

const DEMO_CAMERA_NAMES = ["Camera 1 - Main Pitch", "Camera 2 - Wide Ground", "Camera 3 - Batsman Close"]

export function useCameras() {
  const cameras = useDirectorStore((s) => s.cameras)
  const activeCameraId = useDirectorStore((s) => s.activeCameraId)
  const addCamera = useDirectorStore((s) => s.addCamera)
  const removeCamera = useDirectorStore((s) => s.removeCamera)
  const setActiveCamera = useDirectorStore((s) => s.setActiveCamera)
  const updateCamera = useDirectorStore((s) => s.updateCamera)

  const takeLive = useCallback(
    (cameraId: string) => {
      setActiveCamera(cameraId)
    },
    [setActiveCamera],
  )

  const previewCamera = useCallback(
    (cameraId: string) => {
      const camera = cameras.find((c) => c.id === cameraId)
      if (camera?.stream) {
        const video = document.querySelector(`[data-camera-preview="${cameraId}"]`) as HTMLVideoElement
        if (video) {
          video.srcObject = camera.stream
        }
      }
    },
    [cameras],
  )

  // Initialize demo cameras (simulates LiveKit discovery)
  useEffect(() => {
    if (cameras.length === 0) {
      DEMO_CAMERA_NAMES.forEach((name, i) => {
        addCamera({
          id: `demo-cam-${i + 1}`,
          name,
          status: "connected",
          battery: 100 - i * 10,
          signal: 95 - i * 5,
        })
      })
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return {
    cameras,
    activeCameraId,
    addCamera,
    removeCamera,
    takeLive,
    previewCamera,
    updateCamera,
  }
}
