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

// PlayHQ types
export type MockScenario = "single-match" | "multiple-matches" | "no-matches" | "connection-failure"

export interface PlayHQConnectionFields {
  tenant: string
  clientId: string
  clientSecret: string
  organisationId: string
}

export interface PlayHQConnectionResult {
  connected: boolean
  tenant?: string
  organisationId?: string
  error?: string
}

export interface PlayHQLiveMatch {
  id: string
  name: string
}

export interface PlayHQScorecard {
  matchId: string
  homeTeam: string
  awayTeam: string
  innings: {
    score: string
    overs: string
  }
  batter: {
    name: string
    runs: number
    balls: number
  }
  bowler: {
    name: string
    wickets: number
    runsConceded: number
  }
}

export type PlayHQConnectionStatus = "disconnected" | "connecting" | "connected" | "error"

// Live Scorer types
export type GameType = "Cricket" | "Basketball" | "Netball" | "AFL"

export type WicketType = "bowled" | "caught" | "runOut" | "stumped" | "other"

export interface MatchSetupData {
  venue: string
  teamA: string
  teamB: string
  playersA: string[]
  playersB: string[]
  overs: number
  tossWinner: "Team A" | "Team B" | ""
  battingFirst: "Team A" | "Team B" | ""
  playerNames: Record<string, string>
}

export interface BatterState {
  name: string
  runs: number
  balls: number
  isOut: boolean
}

export interface BowlerState {
  name: string
  runsConceded: number
  wickets: number
  balls: number
}

export interface ScoringState {
  runs: number
  wickets: number
  overs: number
  balls: number
  extras: number
  target: number
  battingTeam: string
  bowlingTeam: string
  striker: string | null
  runner: string | null
  currentBowler: string | null
  batters: BatterState[]
  bowlers: BowlerState[]
  currentOverBalls: BallEvent[]
  history: BallEvent[]
  initialStriker: string | null
  initialRunner: string | null
  initialBowler: string | null
  inningsNumber: number
  firstInningsScore: number | null
  firstInningsOvers: number
  firstInningsBalls: number
  firstInningsWickets: number
  firstInningsRuns: number
  isSecondInnings: boolean
  ballsRemaining: number
  inningsEnded: boolean
}

export interface BallEvent {
  type: "runs" | "wide" | "noBall" | "byes" | "legByes" | "wicket"
  runs: number
  batter?: string
  bowler?: string
  isExtra: boolean
  extraType?: "wide" | "noBall" | "byes" | "legByes"
  dismissedBatter?: string
  wicketType?: WicketType
  fielder?: string
}

export interface OverlayScoreModel {
  battingTeam: string
  bowlingTeam: string
  score: string
  wickets: number
  overs: string
  striker: string | null
  nonStriker: string | null
  bowler: string | null
  lastBall: BallEvent | null
}

export type LiveScorerPhase = "setup" | "playerSelect" | "scoring"

// Score types (legacy, kept for ScoreOverlay compat)
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
