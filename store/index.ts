import { create } from "zustand"
import type {
  CameraDevice,
  BroadcastState,
  PlayHQConnectionStatus,
  PlayHQLiveMatch,
  PlayHQScorecard,
  MatchSetupData,
  ScoringState,
  OverlayScoreModel,
  LiveScorerPhase,
  GameType,
  ExpandedPanel,
} from "@/types"
import { saveLiveMatch, loadLiveMatch, clearLiveMatch } from "@/lib/live-scorer-storage"
import { createInitialScoringState, getOverlayModel } from "@/services/cricket-scoring-engine"

interface DirectorStore {
  // Camera state
  activeCameraId: string | null
  cameras: CameraDevice[]
  previewCameraId: string | null
  nextCameraId: number

  // PlayHQ state
  playhqConnectionStatus: PlayHQConnectionStatus
  playhqTenant: string | null
  playhqOrganisationId: string | null
  playhqLiveMatches: PlayHQLiveMatch[]
  playhqSelectedMatchId: string | null
  playhqScorecard: PlayHQScorecard | null

  // Overlay state
  overlayVisible: boolean

  // Panel expansion state
  expandedPanel: ExpandedPanel

  // Live Scorer state
  liveScorerPhase: LiveScorerPhase
  liveScorerGameType: GameType
  matchSetup: MatchSetupData | null
  scoringState: ScoringState | null

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

  // Actions - PlayHQ
  setPlayHQConnectionStatus: (status: PlayHQConnectionStatus) => void
  setPlayHQConnected: (tenant: string, organisationId: string) => void
  setPlayHQDisconnected: () => void
  setPlayHQLiveMatches: (matches: PlayHQLiveMatch[]) => void
  setPlayHQSelectedMatchId: (id: string | null) => void
  setPlayHQScorecard: (scorecard: PlayHQScorecard | null) => void

  // Actions - Overlay
  toggleOverlay: () => void
  setOverlayVisible: (visible: boolean) => void

  // Actions - Panel expansion
  setExpandedPanel: (panel: ExpandedPanel) => void

  // Actions - Live Scorer
  setLiveScorerPhase: (phase: LiveScorerPhase) => void
  saveMatchSetupData: (data: MatchSetupData) => void
  setScoringState: (state: ScoringState) => void
  startScoring: () => void
  resetScorer: () => void
  getOverlayScoreModel: () => OverlayScoreModel | null
  updatePlayerName: (playerId: string, name: string) => void
  restoreMatch: (data: { matchSetup: MatchSetupData; scoringState: ScoringState; liveScorerPhase: LiveScorerPhase }) => void

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

function persistState(matchSetup: MatchSetupData | null, scoringState: ScoringState | null, liveScorerPhase: LiveScorerPhase) {
  if (!matchSetup || !scoringState) return
  const overlayState = getOverlayModel(scoringState)
  saveLiveMatch({ matchSetup, scoringState, liveScorerPhase, overlayState })
}

export const useDirectorStore = create<DirectorStore>((set, get) => ({
  // Initial camera state
  activeCameraId: null,
  cameras: [],
  previewCameraId: null,
  nextCameraId: 2,

  // Initial PlayHQ state
  playhqConnectionStatus: "disconnected",
  playhqTenant: null,
  playhqOrganisationId: null,
  playhqLiveMatches: [],
  playhqSelectedMatchId: null,
  playhqScorecard: null,

  // Overlay state
  overlayVisible: true,

  // Panel expansion state
  expandedPanel: "none",

  // Initial Live Scorer state
  liveScorerPhase: "setup",
  liveScorerGameType: "Cricket",
  matchSetup: null,
  scoringState: null,

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
        nextCameraId: state.nextCameraId + 1,
      }
    }),

  removeCamera: (cameraId) =>
    set((state) => ({
      cameras: state.cameras.filter((c) => c.id !== cameraId),
      activeCameraId: state.activeCameraId === cameraId
        ? (state.cameras.find((c) => c.id !== cameraId)?.id ?? null)
        : state.activeCameraId,
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

  // PlayHQ actions
  setPlayHQConnectionStatus: (status) =>
    set(() => ({ playhqConnectionStatus: status })),

  setPlayHQConnected: (tenant, organisationId) =>
    set(() => ({
      playhqConnectionStatus: "connected",
      playhqTenant: tenant,
      playhqOrganisationId: organisationId,
    })),

  setPlayHQDisconnected: () =>
    set(() => ({
      playhqConnectionStatus: "disconnected",
      playhqTenant: null,
      playhqOrganisationId: null,
      playhqLiveMatches: [],
      playhqSelectedMatchId: null,
      playhqScorecard: null,
    })),

  setPlayHQLiveMatches: (matches) =>
    set(() => ({ playhqLiveMatches: matches })),

  setPlayHQSelectedMatchId: (id) =>
    set(() => ({ playhqSelectedMatchId: id })),

  setPlayHQScorecard: (scorecard) =>
    set(() => ({ playhqScorecard: scorecard })),

  // Overlay actions
  toggleOverlay: () => set((state) => ({ overlayVisible: !state.overlayVisible })),
  setOverlayVisible: (visible) => set(() => ({ overlayVisible: visible })),

  // Panel expansion
  setExpandedPanel: (panel) =>
    set(() => ({ expandedPanel: panel })),

  // Live Scorer actions
  setLiveScorerPhase: (phase) =>
    set(() => ({ liveScorerPhase: phase })),

  saveMatchSetupData: (data) => {
    persistState(data, get().scoringState, get().liveScorerPhase)
    set(() => ({ matchSetup: data }))
  },

  setScoringState: (scoringState) => {
    persistState(get().matchSetup, scoringState, get().liveScorerPhase)
    set(() => ({ scoringState }))
  },

  startScoring: () => {
    const { matchSetup } = get()
    if (!matchSetup) return
    const state = createInitialScoringState(matchSetup)
    persistState(matchSetup, state, "playerSelect")
    set(() => ({
      scoringState: state,
      liveScorerPhase: "playerSelect",
    }))
  },

  resetScorer: () => {
    clearLiveMatch()
    set(() => ({
      matchSetup: null,
      scoringState: null,
      liveScorerPhase: "setup",
    }))
  },

  getOverlayScoreModel: () => {
    const { scoringState } = get()
    if (!scoringState) return null
    return getOverlayModel(scoringState)
  },

  updatePlayerName: (playerId, name) => {
    const { matchSetup, scoringState } = get()
    if (!matchSetup) return

    const updatedNames = { ...matchSetup.playerNames, [playerId]: name }
    const updatedSetup = { ...matchSetup, playerNames: updatedNames }
    set(() => ({ matchSetup: updatedSetup }))

    if (scoringState) {
      persistState(updatedSetup, scoringState, get().liveScorerPhase)
    }
  },

  restoreMatch: (data) => {
    set(() => ({
      matchSetup: data.matchSetup,
      scoringState: data.scoringState,
      liveScorerPhase: data.liveScorerPhase,
    }))
  },

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
