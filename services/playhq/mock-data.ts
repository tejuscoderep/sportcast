import type { PlayHQLiveMatch, PlayHQScorecard } from "@/types"

export const MOCK_LIVE_MATCHES: Record<string, PlayHQLiveMatch[]> = {
  "single-match": [
    { id: "match-001", name: "Brisbane Tigers vs Gold Coast Sharks" },
  ],
  "multiple-matches": [
    { id: "match-001", name: "Brisbane Tigers vs Gold Coast Sharks" },
    { id: "match-002", name: "Sunshine Coast vs Ipswich" },
  ],
  "no-matches": [],
  "connection-failure": [],
}

export const MOCK_SCORECARDS: Record<string, PlayHQScorecard> = {
  "match-001": {
    matchId: "match-001",
    homeTeam: "Brisbane Tigers",
    awayTeam: "Gold Coast Sharks",
    innings: {
      score: "145/3",
      overs: "17.2",
    },
    batter: {
      name: "Carey",
      runs: 45,
      balls: 32,
    },
    bowler: {
      name: "Johnson",
      wickets: 2,
      runsConceded: 24,
    },
  },
  "match-002": {
    matchId: "match-002",
    homeTeam: "Sunshine Coast",
    awayTeam: "Ipswich",
    innings: {
      score: "89/1",
      overs: "12.4",
    },
    batter: {
      name: "Hughes",
      runs: 38,
      balls: 28,
    },
    bowler: {
      name: "Richardson",
      wickets: 1,
      runsConceded: 31,
    },
  },
}
