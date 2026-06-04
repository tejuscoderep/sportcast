// Mock PlayHQ Data for Cricket Match
export interface Player {
  id: string
  name: string
  runs: number
  balls: number
  fours: number
  sixes: number
  isStriker: boolean
  isOut: boolean
}

export interface Bowler {
  id: string
  name: string
  overs: number
  maidens: number
  runs: number
  wickets: number
  economy: number
}

export interface Team {
  id: string
  name: string
  shortName: string
  score: number
  wickets: number
  overs: number
  balls: number
  runRate: number
}

export interface MatchDetails {
  id: string
  competition: string
  venue: string
  date: string
  status: "live" | "completed" | "upcoming"
  currentInnings: number
  toss: string
}

export interface PlayHQData {
  match: MatchDetails
  battingTeam: Team
  bowlingTeam: Team
  currentBatsmen: Player[]
  currentBowler: Bowler
  recentBalls: string[]
  partnership: {
    runs: number
    balls: number
  }
}

export const mockPlayHQData: PlayHQData = {
  match: {
    id: "PHQ-2024-001",
    competition: "Premier Cricket League",
    venue: "Melbourne Cricket Ground",
    date: "2024-03-15",
    status: "live",
    currentInnings: 1,
    toss: "Sydney Thunder won toss, elected to bat",
  },
  battingTeam: {
    id: "team-1",
    name: "Sydney Thunder",
    shortName: "SYD",
    score: 156,
    wickets: 4,
    overs: 18,
    balls: 3,
    runRate: 8.52,
  },
  bowlingTeam: {
    id: "team-2",
    name: "Melbourne Stars",
    shortName: "MEL",
    score: 0,
    wickets: 0,
    overs: 0,
    balls: 0,
    runRate: 0,
  },
  currentBatsmen: [
    {
      id: "bat-1",
      name: "David Warner",
      runs: 67,
      balls: 42,
      fours: 8,
      sixes: 2,
      isStriker: true,
      isOut: false,
    },
    {
      id: "bat-2",
      name: "Steve Smith",
      runs: 34,
      balls: 28,
      fours: 3,
      sixes: 1,
      isStriker: false,
      isOut: false,
    },
  ],
  currentBowler: {
    id: "bowl-1",
    name: "Mitchell Starc",
    overs: 3.3,
    maidens: 0,
    runs: 28,
    wickets: 1,
    economy: 8.0,
  },
  recentBalls: ["1", "4", "0", "W", "2", "6"],
  partnership: {
    runs: 78,
    balls: 52,
  },
}

export interface CameraFeed {
  id: string
  name: string
  label: string
  isActive: boolean
  status: "online" | "offline" | "standby"
}

export const mockCameraFeeds: CameraFeed[] = [
  { id: "cam-1", name: "Camera 1", label: "Main - Pitch", isActive: true, status: "online" },
  { id: "cam-2", name: "Camera 2", label: "Wide - Ground", isActive: false, status: "online" },
  { id: "cam-3", name: "Camera 3", label: "Close - Batsman", isActive: false, status: "online" },
]

export interface StreamPlatform {
  id: string
  name: string
  icon: string
  isConnected: boolean
  viewers: number
  status: "streaming" | "ready" | "error" | "offline"
}

export const mockStreamPlatforms: StreamPlatform[] = [
  { id: "youtube", name: "YouTube", icon: "youtube", isConnected: true, viewers: 12453, status: "ready" },
  { id: "facebook", name: "Facebook", icon: "facebook", isConnected: true, viewers: 8721, status: "ready" },
]

export interface StreamStatus {
  isLive: boolean
  duration: string
  bitrate: number
  fps: number
  resolution: string
  droppedFrames: number
}

export const mockStreamStatus: StreamStatus = {
  isLive: false,
  duration: "00:00:00",
  bitrate: 6000,
  fps: 60,
  resolution: "1920x1080",
  droppedFrames: 0,
}
