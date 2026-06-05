import { describe, it, expect, beforeEach } from "vitest"
import {
  createInitialScoringState,
  scoreRuns,
  scoreWide,
  scoreNoBall,
  scoreByes,
  scoreLegByes,
  scoreWicket,
  undoLastBall,
  setStriker,
  setRunner,
  setCurrentBowler,
  getOverlayModel,
  formatOvers,
  getDisplayName,
  getRunRate,
  getRequiredRunRate,
  getBatterStrikeRate,
  getBowlerEconomy,
  formatBowlerFigures,
  formatCurrentOver,
} from "@/services/cricket-scoring-engine"
import type { MatchSetupData, ScoringState, BatterState, BowlerState } from "@/types"

const TEST_SETUP: MatchSetupData = {
  venue: "Test Ground",
  teamA: "Team Alpha",
  teamB: "Team Beta",
  playersA: ["A1", "A2", "A3", "A4", "A5", "A6", "A7", "A8", "A9", "A10", "A11"],
  playersB: ["B1", "B2", "B3", "B4", "B5", "B6", "B7", "B8", "B9", "B10", "B11"],
  overs: 20,
  tossWinner: "Team A",
  battingFirst: "Team A",
  playerNames: {},
}

function createState(): ScoringState {
  let state = createInitialScoringState(TEST_SETUP)
  state = setStriker(state, "A1")
  state = setRunner(state, "A2")
  state = setCurrentBowler(state, "B1")
  return state
}

describe("cricketScoringEngine", () => {
  let state: ScoringState

  beforeEach(() => {
    state = createState()
  })

  describe("createInitialScoringState", () => {
    it("sets batting team based on battingFirst", () => {
      const s = createInitialScoringState(TEST_SETUP)
      expect(s.battingTeam).toBe("Team Alpha")
      expect(s.bowlingTeam).toBe("Team Beta")
    })

    it("initializes all counters to 0", () => {
      const s = createInitialScoringState(TEST_SETUP)
      expect(s.runs).toBe(0)
      expect(s.wickets).toBe(0)
      expect(s.overs).toBe(0)
      expect(s.balls).toBe(0)
      expect(s.extras).toBe(0)
    })

    it("creates batter states with fours and sixes", () => {
      const s = createInitialScoringState(TEST_SETUP)
      expect(s.batters).toHaveLength(11)
      expect(s.batters[0].name).toBe("A1")
      expect(s.batters[0].fours).toBe(0)
      expect(s.batters[0].sixes).toBe(0)
    })

    it("creates bowler states with maidens", () => {
      const s = createInitialScoringState(TEST_SETUP)
      expect(s.bowlers).toHaveLength(11)
      expect(s.bowlers[0].maidens).toBe(0)
    })

    it("sets innings phase to READY", () => {
      const s = createInitialScoringState(TEST_SETUP)
      expect(s.inningsPhase).toBe("READY")
      expect(s.inningsNumber).toBe(1)
      expect(s.isSecondInnings).toBe(false)
    })

    it("sets balls remaining based on overs", () => {
      const s = createInitialScoringState(TEST_SETUP)
      expect(s.ballsRemaining).toBe(120)
    })

    it("initializes partnership to 0", () => {
      const s = createInitialScoringState(TEST_SETUP)
      expect(s.partnership).toBe(0)
    })
  })

  describe("scoreRuns", () => {
    it("adds 1 run and rotates strike", () => {
      const s = scoreRuns(state, 1)
      expect(s.runs).toBe(1)
      expect(s.striker).toBe("A2")
      expect(s.runner).toBe("A1")
    })

    it("adds 2 runs without rotating strike", () => {
      const s = scoreRuns(state, 2)
      expect(s.runs).toBe(2)
      expect(s.striker).toBe("A1")
      expect(s.runner).toBe("A2")
    })

    it("adds 4 runs and tracks fours", () => {
      const s = scoreRuns(state, 4)
      expect(s.runs).toBe(4)
      expect(s.batters.find((b) => b.name === "A1")!.fours).toBe(1)
      expect(s.batters.find((b) => b.name === "A1")!.sixes).toBe(0)
    })

    it("adds 6 runs and tracks sixes", () => {
      const s = scoreRuns(state, 6)
      expect(s.runs).toBe(6)
      expect(s.batters.find((b) => b.name === "A1")!.sixes).toBe(1)
      expect(s.batters.find((b) => b.name === "A1")!.fours).toBe(0)
    })

    it("decrements balls remaining", () => {
      const s = scoreRuns(state, 4)
      expect(s.ballsRemaining).toBe(119)
    })

    it("adds to partnership", () => {
      const s = scoreRuns(state, 4)
      expect(s.partnership).toBe(4)
    })

    it("transitions to INNINGS_1 phase", () => {
      const s = scoreRuns(state, 1)
      expect(s.inningsPhase).toBe("INNINGS_1")
    })

    it("creates score events with proper structure", () => {
      const s = scoreRuns(state, 4)
      const event = s.history[0]
      expect(event.eventType).toBe("runs")
      expect(event.runs).toBe(4)
      expect(event.batter).toBe("A1")
      expect(event.bowler).toBe("B1")
      expect(event.innings).toBe(1)
      expect(event.id).toBeDefined()
      expect(event.timestamp).toBeDefined()
    })
  })

  describe("over completion", () => {
    it("increments over after 6 balls", () => {
      let s = state
      for (let i = 0; i < 6; i++) s = scoreRuns(s, 0)
      expect(s.overs).toBe(1)
      expect(s.balls).toBe(0)
    })

    it("swaps strike at end of over", () => {
      let s = state
      for (let i = 0; i < 6; i++) s = scoreRuns(s, 0)
      expect(s.striker).toBe("A2")
      expect(s.runner).toBe("A1")
    })

    it("tracks maiden over for bowler", () => {
      let s = state
      for (let i = 0; i < 6; i++) s = scoreRuns(s, 0)
      expect(s.bowlers.find((b) => b.name === "B1")!.maidens).toBe(1)
    })

    it("stores previous over balls", () => {
      let s = state
      for (let i = 0; i < 6; i++) s = scoreRuns(s, i + 1)
      expect(s.previousOverBalls).toHaveLength(6)
      expect(s.currentOverBalls).toHaveLength(0)
    })
  })

  describe("scoreWide", () => {
    it("adds 1 run for wide (1 + 0 extra)", () => {
      const s = scoreWide(state, 0)
      expect(s.runs).toBe(1)
      expect(s.extras).toBe(1)
    })

    it("does not increment ball count", () => {
      const s = scoreWide(state, 0)
      expect(s.balls).toBe(0)
    })

    it("rotates strike on odd total runs", () => {
      const s = scoreWide(state, 0) // 1 total = odd
      expect(s.striker).toBe("A2")
    })

    it("does not rotate strike on even total runs", () => {
      const s = scoreWide(state, 1) // 2 total = even
      expect(s.striker).toBe("A1")
    })

    it("adds to partnership", () => {
      const s = scoreWide(state, 2)
      expect(s.partnership).toBe(3) // 1 + 2
    })
  })

  describe("scoreNoBall", () => {
    it("adds 1 + batsman runs", () => {
      const s = scoreNoBall(state, 4)
      expect(s.runs).toBe(5)
      expect(s.extras).toBe(1)
    })

    it("does not increment ball count", () => {
      const s = scoreNoBall(state, 0)
      expect(s.balls).toBe(0)
    })

    it("adds batsman runs to batter", () => {
      const s = scoreNoBall(state, 4)
      expect(s.batters.find((b) => b.name === "A1")!.runs).toBe(4)
      expect(s.batters.find((b) => b.name === "A1")!.balls).toBe(0)
    })

    it("does not rotate strike", () => {
      const s = scoreNoBall(state, 1)
      expect(s.striker).toBe("A1")
    })

    it("adds to partnership", () => {
      const s = scoreNoBall(state, 2)
      expect(s.partnership).toBe(3) // 1 + 2
    })
  })

  describe("scoreByes", () => {
    it("adds bye runs to team score", () => {
      const s = scoreByes(state, 2)
      expect(s.runs).toBe(2)
      expect(s.extras).toBe(2)
    })

    it("increments ball count", () => {
      const s = scoreByes(state, 2)
      expect(s.balls).toBe(1)
    })

    it("does not add runs to batter", () => {
      const s = scoreByes(state, 2)
      expect(s.batters.find((b) => b.name === "A1")!.runs).toBe(0)
    })

    it("rotates strike on odd runs", () => {
      const s = scoreByes(state, 1)
      expect(s.striker).toBe("A2")
    })

    it("adds to partnership", () => {
      const s = scoreByes(state, 3)
      expect(s.partnership).toBe(3)
    })
  })

  describe("scoreLegByes", () => {
    it("behaves same as byes", () => {
      const s = scoreLegByes(state, 2)
      expect(s.runs).toBe(2)
      expect(s.extras).toBe(2)
      expect(s.balls).toBe(1)
    })
  })

  describe("scoreWicket", () => {
    it("increments wickets", () => {
      const s = scoreWicket(state, "bowled")
      expect(s.wickets).toBe(1)
    })

    it("clears striker and resets partnership", () => {
      const s1 = scoreRuns(state, 4)
      expect(s1.partnership).toBe(4)
      const s2 = scoreWicket(s1, "bowled")
      expect(s2.striker).toBeNull()
      expect(s2.partnership).toBe(0)
    })

    it("records wicket type and fielder in event", () => {
      const s = scoreWicket(state, "caught", "B2")
      expect(s.history[0].wicketType).toBe("caught")
      expect(s.history[0].fielder).toBe("B2")
    })

    it("supports all wicket types", () => {
      const types = ["bowled", "caught", "runOut", "stumped", "lbw", "retiredHurt", "other"] as const
      types.forEach((wt) => {
        const s = scoreWicket(state, wt)
        expect(s.wickets).toBe(1)
      })
    })
  })

  describe("undoLastBall", () => {
    it("undoes a run scoring ball", () => {
      const s1 = scoreRuns(state, 4)
      const s2 = undoLastBall(s1)
      expect(s2.runs).toBe(0)
      expect(s2.balls).toBe(0)
    })

    it("restores strike rotation after undo", () => {
      const s1 = scoreRuns(state, 1)
      expect(s1.striker).toBe("A2")
      const s2 = undoLastBall(s1)
      expect(s2.striker).toBe("A1")
      expect(s2.runner).toBe("A2")
    })

    it("restores partnership after undo", () => {
      const s1 = scoreRuns(state, 4)
      expect(s1.partnership).toBe(4)
      const s2 = undoLastBall(s1)
      expect(s2.partnership).toBe(0)
    })

    it("restores fours and sixes after undo", () => {
      const s1 = scoreRuns(state, 4)
      expect(s1.batters.find((b) => b.name === "A1")!.fours).toBe(1)
      const s2 = undoLastBall(s1)
      expect(s2.batters.find((b) => b.name === "A1")!.fours).toBe(0)
    })

    it("returns same state if no history", () => {
      const s = undoLastBall(state)
      expect(s.runs).toBe(0)
    })
  })

  describe("getRunRate", () => {
    it("returns 0 for no balls", () => {
      expect(getRunRate(state)).toBe(0)
    })

    it("calculates run rate correctly", () => {
      const s = scoreRuns(state, 6) // 6 runs off 1 ball = 36 RPO
      expect(getRunRate(s)).toBe(36)
    })
  })

  describe("getRequiredRunRate", () => {
    it("returns null for first innings", () => {
      expect(getRequiredRunRate(state)).toBeNull()
    })
  })

  describe("getBatterStrikeRate", () => {
    it("returns 0 for no balls", () => {
      expect(getBatterStrikeRate(state.batters[0])).toBe(0)
    })

    it("calculates strike rate", () => {
      const batter: BatterState = { name: "A1", runs: 50, balls: 40, fours: 5, sixes: 1, isOut: false }
      expect(getBatterStrikeRate(batter)).toBe(125)
    })
  })

  describe("getBowlerEconomy", () => {
    it("returns 0 for no balls", () => {
      expect(getBowlerEconomy(state.bowlers[0])).toBe(0)
    })

    it("calculates economy", () => {
      const bowler: BowlerState = { name: "B1", runsConceded: 30, wickets: 0, balls: 24, maidens: 0 }
      expect(getBowlerEconomy(bowler)).toBe(7.5)
    })
  })

  describe("formatBowlerFigures", () => {
    it("formats bowler figures", () => {
      const bowler: BowlerState = { name: "B1", runsConceded: 24, wickets: 2, balls: 20, maidens: 0 }
      expect(formatBowlerFigures(bowler)).toBe("3.2-0-24-2")
    })
  })

  describe("formatCurrentOver", () => {
    it("formats empty over", () => {
      expect(formatCurrentOver([])).toBe("")
    })

    it("formats mixed over", () => {
      const s1 = scoreRuns(state, 1)
      const s2 = scoreRuns(s1, 4)
      const overStr = formatCurrentOver(s2.currentOverBalls)
      expect(overStr).toContain("1")
      expect(overStr).toContain("4")
    })
  })

  describe("getOverlayModel", () => {
    it("returns correct overlay data with run rate and partnership", () => {
      const s = scoreRuns(state, 4)
      const model = getOverlayModel(s)
      expect(model.battingTeam).toBe("Team Alpha")
      expect(model.score).toBe("4/0")
      expect(model.currentRunRate).toBe(24)
      expect(model.partnership).toBe(4)
      expect(model.requiredRunRate).toBeNull()
      expect(model.target).toBeNull()
    })
  })

  describe("getDisplayName", () => {
    it("returns player id when no custom name", () => {
      expect(getDisplayName("TAP01", {})).toBe("TAP01")
    })

    it("returns id with custom name when set", () => {
      expect(getDisplayName("TAP01", { TAP01: "John" })).toBe("TAP01 John")
    })
  })

  describe("setRunner", () => {
    it("sets runner", () => {
      const s = setRunner(state, "A3")
      expect(s.runner).toBe("A3")
    })
  })
})
