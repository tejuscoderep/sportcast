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
} from "@/services/cricket-scoring-engine"
import type { MatchSetupData, ScoringState } from "@/types"

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

    it("creates batter states for batting team players", () => {
      const s = createInitialScoringState(TEST_SETUP)
      expect(s.batters).toHaveLength(11)
      expect(s.batters[0].name).toBe("A1")
    })

    it("creates bowler states for bowling team players", () => {
      const s = createInitialScoringState(TEST_SETUP)
      expect(s.bowlers).toHaveLength(11)
      expect(s.bowlers[0].name).toBe("B1")
    })

    it("sets innings number to 1", () => {
      const s = createInitialScoringState(TEST_SETUP)
      expect(s.inningsNumber).toBe(1)
      expect(s.isSecondInnings).toBe(false)
    })

    it("sets balls remaining based on overs", () => {
      const s = createInitialScoringState(TEST_SETUP)
      expect(s.ballsRemaining).toBe(120) // 20 * 6
    })
  })

  describe("scoreRuns", () => {
    it("adds 0 runs (dot ball)", () => {
      const s = scoreRuns(state, 0)
      expect(s.runs).toBe(0)
      expect(s.balls).toBe(1)
      expect(s.batters.find((b) => b.name === "A1")!.balls).toBe(1)
    })

    it("adds 1 run and rotates strike", () => {
      const s = scoreRuns(state, 1)
      expect(s.runs).toBe(1)
      expect(s.striker).toBe("A2")
      expect(s.runner).toBe("A1")
      expect(s.batters.find((b) => b.name === "A1")!.runs).toBe(1)
    })

    it("adds 2 runs without rotating strike", () => {
      const s = scoreRuns(state, 2)
      expect(s.runs).toBe(2)
      expect(s.striker).toBe("A1")
      expect(s.runner).toBe("A2")
    })

    it("adds 3 runs and rotates strike", () => {
      const s = scoreRuns(state, 3)
      expect(s.runs).toBe(3)
      expect(s.striker).toBe("A2")
      expect(s.runner).toBe("A1")
    })

    it("adds 4 runs (boundary) without rotating strike", () => {
      const s = scoreRuns(state, 4)
      expect(s.runs).toBe(4)
      expect(s.striker).toBe("A1")
    })

    it("adds 5 runs and rotates strike", () => {
      const s = scoreRuns(state, 5)
      expect(s.runs).toBe(5)
      expect(s.striker).toBe("A2")
    })

    it("adds 6 runs (boundary) without rotating strike", () => {
      const s = scoreRuns(state, 6)
      expect(s.runs).toBe(6)
      expect(s.striker).toBe("A1")
    })

    it("increments batter balls faced", () => {
      const s = scoreRuns(state, 4)
      expect(s.batters.find((b) => b.name === "A1")!.runs).toBe(4)
      expect(s.batters.find((b) => b.name === "A1")!.balls).toBe(1)
    })

    it("adds runs to bowler conceded", () => {
      const s = scoreRuns(state, 4)
      expect(s.bowlers.find((b) => b.name === "B1")!.runsConceded).toBe(4)
      expect(s.bowlers.find((b) => b.name === "B1")!.balls).toBe(1)
    })

    it("decrements balls remaining", () => {
      const s = scoreRuns(state, 4)
      expect(s.ballsRemaining).toBe(119)
    })
  })

  describe("over completion", () => {
    it("increments over after 6 balls", () => {
      let s = state
      for (let i = 0; i < 6; i++) {
        s = scoreRuns(s, 0)
      }
      expect(s.overs).toBe(1)
      expect(s.balls).toBe(0)
    })

    it("swaps strike at end of over", () => {
      let s = state
      for (let i = 0; i < 6; i++) {
        s = scoreRuns(s, 0) // dot balls, no strike rotation
      }
      // End of over swaps strike
      expect(s.striker).toBe("A2")
      expect(s.runner).toBe("A1")
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

    it("does not increment batter balls", () => {
      const s = scoreWide(state, 0)
      expect(s.batters.find((b) => b.name === "A1")!.balls).toBe(0)
    })

    it("adds wide runs to bowler conceded", () => {
      const s = scoreWide(state, 0)
      expect(s.bowlers.find((b) => b.name === "B1")!.runsConceded).toBe(1)
    })

    it("supports multiple wide runs", () => {
      const s = scoreWide(state, 3)
      expect(s.runs).toBe(4) // 1 + 3
      expect(s.balls).toBe(0)
    })

    it("rotates strike on odd total runs", () => {
      const s = scoreWide(state, 0) // 1 total = odd
      expect(s.striker).toBe("A2")
      expect(s.runner).toBe("A1")
    })

    it("does not rotate strike on even total runs", () => {
      const s = scoreWide(state, 1) // 2 total = even
      expect(s.striker).toBe("A1")
      expect(s.runner).toBe("A2")
    })
  })

  describe("scoreNoBall", () => {
    it("adds 1 run for no ball with 0 extra runs", () => {
      const s = scoreNoBall(state, 0)
      expect(s.runs).toBe(1)
      expect(s.extras).toBe(1)
    })

    it("adds 1 + batsman runs", () => {
      const s = scoreNoBall(state, 4)
      expect(s.runs).toBe(5) // 1 no ball + 4 batsman
      expect(s.extras).toBe(1)
    })

    it("does not increment ball count", () => {
      const s = scoreNoBall(state, 0)
      expect(s.balls).toBe(0)
    })

    it("adds batsman runs to batter", () => {
      const s = scoreNoBall(state, 4)
      expect(s.batters.find((b) => b.name === "A1")!.runs).toBe(4)
      expect(s.batters.find((b) => b.name === "A1")!.balls).toBe(0) // no ball doesn't count as ball
    })

    it("does not rotate strike", () => {
      const s = scoreNoBall(state, 1)
      expect(s.striker).toBe("A1")
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

    it("increments batter balls faced", () => {
      const s = scoreByes(state, 2)
      expect(s.batters.find((b) => b.name === "A1")!.balls).toBe(1)
    })

    it("rotates strike on odd runs", () => {
      const s = scoreByes(state, 1)
      expect(s.striker).toBe("A2")
    })

    it("does not rotate strike on even runs", () => {
      const s = scoreByes(state, 2)
      expect(s.striker).toBe("A1")
    })
  })

  describe("scoreLegByes", () => {
    it("behaves same as byes", () => {
      const s = scoreLegByes(state, 2)
      expect(s.runs).toBe(2)
      expect(s.extras).toBe(2)
      expect(s.balls).toBe(1)
      expect(s.batters.find((b) => b.name === "A1")!.runs).toBe(0)
    })

    it("rotates strike on odd runs", () => {
      const s = scoreLegByes(state, 3)
      expect(s.striker).toBe("A2")
    })
  })

  describe("scoreWicket", () => {
    it("increments wickets", () => {
      const s = scoreWicket(state, "bowled")
      expect(s.wickets).toBe(1)
    })

    it("increments ball count", () => {
      const s = scoreWicket(state, "bowled")
      expect(s.balls).toBe(1)
    })

    it("marks striker as out", () => {
      const s = scoreWicket(state, "bowled")
      expect(s.batters.find((b) => b.name === "A1")!.isOut).toBe(true)
    })

    it("clears striker (new batter needed)", () => {
      const s = scoreWicket(state, "bowled")
      expect(s.striker).toBeNull()
    })

    it("increments bowler wickets", () => {
      const s = scoreWicket(state, "bowled")
      expect(s.bowlers.find((b) => b.name === "B1")!.wickets).toBe(1)
    })

    it("records wicket type in history", () => {
      const s = scoreWicket(state, "caught")
      expect(s.history[0].wicketType).toBe("caught")
    })

    it("records fielder for caught wicket", () => {
      const s = scoreWicket(state, "caught", "B2")
      expect(s.history[0].fielder).toBe("B2")
    })
  })

  describe("undoLastBall", () => {
    it("undoes a run scoring ball", () => {
      const s1 = scoreRuns(state, 4)
      expect(s1.runs).toBe(4)
      const s2 = undoLastBall(s1)
      expect(s2.runs).toBe(0)
      expect(s2.balls).toBe(0)
    })

    it("undoes a wicket", () => {
      const s1 = scoreWicket(state, "bowled")
      expect(s1.wickets).toBe(1)
      const s2 = undoLastBall(s1)
      expect(s2.wickets).toBe(0)
    })

    it("undoes a wide", () => {
      const s1 = scoreWide(state, 0)
      expect(s1.runs).toBe(1)
      const s2 = undoLastBall(s1)
      expect(s2.runs).toBe(0)
    })

    it("undoes a no ball", () => {
      const s1 = scoreNoBall(state, 4)
      expect(s1.runs).toBe(5)
      const s2 = undoLastBall(s1)
      expect(s2.runs).toBe(0)
    })

    it("returns same state if no history", () => {
      const s = undoLastBall(state)
      expect(s.runs).toBe(0)
    })

    it("restores batter state after undo", () => {
      const s1 = scoreRuns(state, 4)
      expect(s1.batters.find((b) => b.name === "A1")!.runs).toBe(4)
      const s2 = undoLastBall(s1)
      expect(s2.batters.find((b) => b.name === "A1")!.runs).toBe(0)
    })

    it("restores strike rotation after undo", () => {
      const s1 = scoreRuns(state, 1) // rotates strike
      expect(s1.striker).toBe("A2")
      const s2 = undoLastBall(s1)
      expect(s2.striker).toBe("A1")
      expect(s2.runner).toBe("A2")
    })
  })

  describe("getOverlayModel", () => {
    it("returns correct overlay data", () => {
      const s = scoreRuns(state, 4)
      const model = getOverlayModel(s)
      expect(model.battingTeam).toBe("Team Alpha")
      expect(model.bowlingTeam).toBe("Team Beta")
      expect(model.score).toBe("4/0")
      expect(model.overs).toBe("0.1")
      expect(model.lastBall).toBeDefined()
      expect(model.lastBall!.runs).toBe(4)
    })

    it("shows striker stats in overlay", () => {
      const s = scoreRuns(state, 4)
      const model = getOverlayModel(s)
      expect(model.striker).toContain("A1")
      expect(model.striker).toContain("4")
    })

    it("shows bowler stats in overlay", () => {
      const s = scoreRuns(state, 4)
      const model = getOverlayModel(s)
      expect(model.bowler).toContain("B1")
    })
  })

  describe("formatOvers", () => {
    it("formats 0 overs 0 balls", () => {
      expect(formatOvers(state)).toBe("0.0")
    })

    it("formats partial overs", () => {
      const s = scoreRuns(state, 1)
      expect(formatOvers(s)).toBe("0.1")
    })

    it("formats complete over", () => {
      let s = state
      for (let i = 0; i < 6; i++) s = scoreRuns(s, 0)
      expect(formatOvers(s)).toBe("1.0")
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

    it("captures initial runner on first assignment", () => {
      const s = setRunner(state, "A2")
      expect(s.initialRunner).toBe("A2")
    })
  })
})
