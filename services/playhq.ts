import type { ScoreProvider, MatchData } from "@/types"

const INITIAL_MATCH: MatchData = {
  homeTeam: "Brisbane Tigers",
  awayTeam: "Gold Coast Sharks",
  homeScore: "145/4",
  awayScore: "0/0",
  overs: "17.2",
  wickets: 4,
  currentBatter: "Smith",
  currentBowler: "Johnson",
  competition: "Premier Cricket League",
  venue: "Melbourne Cricket Ground",
}

function simulateScoreUpdate(current: MatchData): MatchData {
  const [runsStr] = current.homeScore.split("/")
  const [oversWhole, oversBall = "0"] = current.overs.split(".")
  let runs = parseInt(runsStr, 10)
  let wickets = current.wickets
  let overNum = parseInt(oversWhole, 10)
  let ballNum = parseInt(oversBall, 10)

  const outcome = Math.random()
  if (outcome < 0.05) {
    wickets = Math.min(wickets + 1, 10)
  } else if (outcome < 0.2) {
    runs += 4
  } else if (outcome < 0.27) {
    runs += 6
  } else if (outcome < 0.55) {
    runs += 1
  } else if (outcome < 0.7) {
    runs += 2
  }
  // else dot ball

  ballNum++
  if (ballNum > 5) {
    ballNum = 0
    overNum++
  }

  const batters = ["Smith", "Warner", "Labuschagne", "Head", "Carey"]
  const bowlers = ["Johnson", "Starc", "Cummins", "Hazlewood", "Richardson"]

  return {
    ...current,
    homeScore: `${runs}/${wickets}`,
    overs: `${overNum}.${ballNum}`,
    wickets,
    currentBatter: batters[Math.floor(Math.random() * batters.length)],
    currentBowler: bowlers[Math.floor(Math.random() * bowlers.length)],
  }
}

export class MockScoreProvider implements ScoreProvider {
  private currentData: MatchData = INITIAL_MATCH

  async getMatch(): Promise<MatchData> {
    return this.currentData
  }

  async getScore(): Promise<MatchData> {
    return this.currentData
  }

  subscribeToScoreUpdates(callback: (data: MatchData) => void): () => void {
    const interval = setInterval(() => {
      this.currentData = simulateScoreUpdate(this.currentData)
      callback(this.currentData)
    }, 5000)

    return () => clearInterval(interval)
  }
}

export function createScoreProvider(): ScoreProvider {
  return new MockScoreProvider()
}
