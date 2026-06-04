import { create } from "zustand"
import type { CameraDevice, MatchData, BroadcastState } from "@/types"

interface DirectorStore {
  // Camera state
  activeCameraId: string | null
  cameras: CameraDevice[]
  previewCameraId: string | null

  // Match/Score state
  matchData: MatchData | null
  overlayVisible: boolean

  // Broadcast state
  broadcastState: BroadcastState

  // LiveKit state
  livekitConnected: boolean
  livekitRoomName: string
  livekitUrl: string

  // Actions - Camera
  addCamera: (camera: CameraDevice) => void
  removeCamera: (cameraId: string) => void
  setActiveCamera: (cameraId: string) => void
  setPreviewCamera: (cameraId: string) => void
  updateCamera: (cameraId: string, updates: Partial<CameraDevice>) => void

  // Actions - Match
  setMatchData: (data: MatchData) => void
  toggleOverlay: () => void
  setOverlayVisible: (visible: boolean) => void

  // Actions - Broadcast
  setBroadcastState: (state: Partial<BroadcastState>) => void

  // Actions - LiveKit
  setLivekitConnected: (connected: boolean) => void
  setLivekitRoomName: (name: string) => void
  setLivekitUrl: (url: string) => void
}

const initialBroadcastState: BroadcastState = {
  status: "offline",
  health: {
    bitrate: 6000,
    fps: 60,
    resolution: "1920x1080",
    droppedFrames: 0,
    connectionStatus: "stable",
  },
  duration: 0,
  platforms: [
    { id: "youtube", name: "YouTube", isConnected: true, status: "ready", viewers: 0 },
    { id: "facebook", name: "Facebook", isConnected: true, status: "ready", viewers: 0 },
  ],
}

export const useDirectorStore = create<DirectorStore>((set) => ({
  // Initial camera state
  activeCameraId: null,
  cameras: [],
  previewCameraId: null,

  // Initial match state
  matchData: null,
  overlayVisible: true,

  // Initial broadcast state
  broadcastState: initialBroadcastState,

  // Initial LiveKit state
  livekitConnected: false,
  livekitRoomName: "",
  livekitUrl: "",

  // Camera actions
  addCamera: (camera) =>
    set((state) => {
      const exists = state.cameras.some((c) => c.id === camera.id)
      if (exists) return state
      const cameras = [...state.cameras, camera]
      return {
        cameras,
        activeCameraId: state.activeCameraId ?? camera.id,
      }
    }),

  removeCamera: (cameraId) =>
    set((state) => ({
      cameras: state.cameras.filter((c) => c.id !== cameraId),
      activeCameraId: state.activeCameraId === cameraId ? null : state.activeCameraId,
      previewCameraId: state.previewCameraId === cameraId ? null : state.previewCameraId,
    })),

  setActiveCamera: (cameraId) =>
    set(() => ({ activeCameraId: cameraId })),

  setPreviewCamera: (cameraId) =>
    set(() => ({ previewCameraId: cameraId })),

  updateCamera: (cameraId, updates) =>
    set((state) => ({
      cameras: state.cameras.map((c) =>
        c.id === cameraId ? { ...c, ...updates } : c
      ),
    })),

  // Match actions
  setMatchData: (data) => set(() => ({ matchData: data })),
  toggleOverlay: () => set((state) => ({ overlayVisible: !state.overlayVisible })),
  setOverlayVisible: (visible) => set(() => ({ overlayVisible: visible })),

  // Broadcast actions
  setBroadcastState: (updates) =>
    set((state) => ({
      broadcastState: { ...state.broadcastState, ...updates },
    })),

  // LiveKit actions
  setLivekitConnected: (connected) => set(() => ({ livekitConnected: connected })),
  setLivekitRoomName: (name) => set(() => ({ livekitRoomName: name })),
  setLivekitUrl: (url) => set(() => ({ livekitUrl: url })),
}))
