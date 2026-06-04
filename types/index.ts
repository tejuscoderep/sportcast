// Camera types
export interface CameraDevice {
  id: string
  name: string
  status: CameraStatus
  battery: number
  signal: number
  trackSid?: string
  stream?: MediaStream
}

export type CameraStatus = "connected" | "connecting" | "disconnected" | "error"

// Score types
export interface MatchData {
  id: string
  homeTeam: string
  awayTeam: string
  homeScore: string
  awayScore: string
  overs: string
  wickets: number
  currentBatter: string
  currentBowler: string
  competition: string
  venue: string
}

export interface LiveMatch {
  id: string
  label: string
  data: MatchData
}

// Score provider interface
export interface ScoreProvider {
  getMatch(): Promise<MatchData>
  getScore(): Promise<MatchData>
  subscribeToScoreUpdates(callback: (data: MatchData) => void): () => void
}

// Broadcast types
export type BroadcastStatus = "offline" | "starting" | "live" | "stopping" | "error"

export interface BroadcastHealth {
  bitrate: number
  fps: number
  resolution: string
  droppedFrames: number
  connectionStatus: "stable" | "unstable" | "disconnected"
}

export interface BroadcastState {
  status: BroadcastStatus
  health: BroadcastHealth
  duration: number
  platforms: BroadcastPlatform[]
}

export interface BroadcastPlatform {
  id: string
  name: string
  isConnected: boolean
  status: "streaming" | "ready" | "error" | "offline"
  viewers: number
}

// Broadcast service interface
export interface BroadcastService {
  startBroadcast(): Promise<void>
  stopBroadcast(): Promise<void>
  getStatus(): BroadcastState
  subscribeToStatus(callback: (state: BroadcastState) => void): () => void
}

// LiveKit types
export interface LiveKitConfig {
  url: string
  token: string
}

export interface RoomState {
  isConnected: boolean
  roomName: string
  participants: string[]
}
