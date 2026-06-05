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

export type WicketType = "bowled" | "caught" | "runOut" | "stumped" | "lbw" | "retiredHurt" | "other"

export type InningsPhase = "SETUP" | "READY" | "INNINGS_1" | "INNINGS_BREAK" | "INNINGS_2" | "COMPLETED"

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
  fours: number
  sixes: number
  isOut: boolean
}

export interface BowlerState {
  name: string
  runsConceded: number
  wickets: number
  balls: number
  maidens: number
}

export interface ScoreEvent {
  id: string
  timestamp: number
  innings: number
  over: number
  ball: number
  eventType: "runs" | "wide" | "noBall" | "byes" | "legByes" | "wicket"
  runs: number
  extras: number
  wicketType?: WicketType
  fielder?: string
  batter: string | null
  bowler: string | null
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
  currentOverBalls: ScoreEvent[]
  previousOverBalls: ScoreEvent[]
  history: ScoreEvent[]
  initialStriker: string | null
  initialRunner: string | null
  initialBowler: string | null
  inningsNumber: number
  inningsPhase: InningsPhase
  firstInningsRuns: number
  firstInningsWickets: number
  firstInningsOvers: number
  firstInningsBalls: number
  isSecondInnings: boolean
  ballsRemaining: number
  partnership: number
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
  currentRunRate: number
  requiredRunRate: number | null
  target: number | null
  partnership: number
  lastBall: ScoreEvent | null
}

export type LiveScorerPhase = "setup" | "playerSelect" | "scoring"

export type ExpandedPanel = "none" | "playhq" | "liveScorer"

// Persisted live match state
export interface LiveMatchPersisted {
  matchSetup: MatchSetupData
  scoringState: ScoringState
  liveScorerPhase: LiveScorerPhase
  overlayState: OverlayScoreModel | null
}

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
