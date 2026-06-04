import type { ScoreProvider, MatchData, LiveMatch } from "@/types"

const MOCK_MATCHES: MatchData[] = [
  {
    id: "match-1",
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
  },
  {
    id: "match-2",
    homeTeam: "Sydney Sixers",
    awayTeam: "Perth Scorchers",
    homeScore: "89/2",
    awayScore: "0/0",
    overs: "12.4",
    wickets: 2,
    currentBatter: "Hughes",
    currentBowler: "Richardson",
    competition: "Premier Cricket League",
    venue: "Sydney Cricket Ground",
  },
  {
    id: "match-3",
    homeTeam: "Adelaide Strikers",
    awayTeam: "Hobart Hurricanes",
    homeScore: "210/6",
    awayScore: "175/8",
    overs: "38.1",
    wickets: 6,
    currentBatter: "Carey",
    currentBowler: "Starc",
    competition: "Premier Cricket League",
    venue: "Adelaide Oval",
  },
]

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

  ballNum++
  if (ballNum > 5) {
    ballNum = 0
    overNum++
  }

  const batters = ["Smith", "Warner", "Labuschagne", "Head", "Carey", "Hughes", "Marsh", "Wade"]
  const bowlers = ["Johnson", "Starc", "Cummins", "Hazlewood", "Richardson", "Lyon", "Zampa"]

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
  private matchesData: Map<string, MatchData> = new Map()

  constructor() {
    MOCK_MATCHES.forEach((m) => this.matchesData.set(m.id, m))
  }

  getMatches(): LiveMatch[] {
    return Array.from(this.matchesData.values()).map((m) => ({
      id: m.id,
      label: `${m.homeTeam} vs ${m.awayTeam}`,
      data: m,
    }))
  }

  async getMatch(): Promise<MatchData> {
    return MOCK_MATCHES[0]
  }

  async getScore(): Promise<MatchData> {
    return MOCK_MATCHES[0]
  }

  subscribeToScoreUpdates(callback: (data: MatchData) => void): () => void {
    const interval = setInterval(() => {
      this.matchesData.forEach((match, id) => {
        const updated = simulateScoreUpdate(match)
        this.matchesData.set(id, updated)
      })
      // Callback with first match for backwards compat
      callback(this.matchesData.values().next().value!)
    }, 5000)

    return () => clearInterval(interval)
  }

  subscribeToAllUpdates(callback: (matches: LiveMatch[]) => void): () => void {
    const interval = setInterval(() => {
      this.matchesData.forEach((match, id) => {
        const updated = simulateScoreUpdate(match)
        this.matchesData.set(id, updated)
      })
      callback(this.getMatches())
    }, 5000)

    return () => clearInterval(interval)
  }

  getMatchById(id: string): MatchData | undefined {
    return this.matchesData.get(id)
  }
}

export function createScoreProvider(): MockScoreProvider {
  return new MockScoreProvider()
}
