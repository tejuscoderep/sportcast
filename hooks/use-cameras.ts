"use client"

import { useEffect, useCallback } from "react"
import { useDirectorStore } from "@/store"

export function useCameras() {
  const cameras = useDirectorStore((s) => s.cameras)
  const activeCameraId = useDirectorStore((s) => s.activeCameraId)
  const addCamera = useDirectorStore((s) => s.addCamera)
  const removeCamera = useDirectorStore((s) => s.removeCamera)
  const setActiveCamera = useDirectorStore((s) => s.setActiveCamera)
  const updateCamera = useDirectorStore((s) => s.updateCamera)
  const nextCameraId = useDirectorStore((s) => s.nextCameraId)

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

  const addNewCamera = useCallback(() => {
    addCamera({
      id: `cam-${nextCameraId}`,
      name: `Camera ${nextCameraId}`,
      status: "connected",
      battery: 80 + Math.floor(Math.random() * 20),
      signal: 85 + Math.floor(Math.random() * 15),
    })
  }, [addCamera, nextCameraId])

  // Initialize with one demo camera
  useEffect(() => {
    if (cameras.length === 0) {
      addCamera({
        id: "cam-1",
        name: "Camera 1 - Main Pitch",
        status: "connected",
        battery: 100,
        signal: 95,
      })
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return {
    cameras,
    activeCameraId,
    addCamera,
    addNewCamera,
    removeCamera,
    takeLive,
    previewCamera,
    updateCamera,
  }
}
