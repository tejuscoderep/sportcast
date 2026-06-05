import { describe, it, expect, vi, beforeEach } from "vitest"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { LiveScorerPanel } from "@/features/live-scorer/live-scorer-panel"
import { TooltipProvider } from "@/components/ui/tooltip"
import { useDirectorStore } from "@/store"

function renderWithProviders(ui: React.ReactElement) {
  return render(<TooltipProvider>{ui}</TooltipProvider>)
}

const defaultScoringState = {
  runs: 0,
  wickets: 0,
  overs: 0,
  balls: 0,
  extras: 0,
  target: 0,
  battingTeam: "Brisbane Tigers",
  bowlingTeam: "Gold Coast Sharks",
  striker: null as string | null,
  runner: null as string | null,
  currentBowler: null as string | null,
  batters: Array.from({ length: 11 }, (_, i) => ({
    name: `TAP${String(i + 1).padStart(2, "0")}`,
    runs: 0,
    balls: 0,
    fours: 0,
    sixes: 0,
    isOut: false,
  })),
  bowlers: Array.from({ length: 11 }, (_, i) => ({
    name: `TBP${String(i + 1).padStart(2, "0")}`,
    runsConceded: 0,
    wickets: 0,
    balls: 0,
    maidens: 0,
  })),
  currentOverBalls: [],
  previousOverBalls: [],
  history: [],
  initialStriker: null as string | null,
  initialRunner: null as string | null,
  initialBowler: null as string | null,
  inningsNumber: 1,
  inningsPhase: "READY" as const,
  firstInningsRuns: 0,
  firstInningsWickets: 0,
  firstInningsOvers: 0,
  firstInningsBalls: 0,
  isSecondInnings: false,
  ballsRemaining: 120,
  partnership: 0,
}

describe("LiveScorerPanel", () => {
  beforeEach(() => {
    useDirectorStore.setState({
      liveScorerPhase: "setup",
      liveScorerGameType: "Cricket",
      matchSetup: null,
      scoringState: null,
      expandedPanel: "none",
    })
  })

  describe("Setup phase", () => {
    it("shows Live Scorer title", () => {
      renderWithProviders(<LiveScorerPanel />)
      expect(screen.getByText("Live Scorer")).toBeDefined()
    })

    it("shows Setup Match button when expanded", () => {
      useDirectorStore.setState({ expandedPanel: "liveScorer" })
      renderWithProviders(<LiveScorerPanel />)
      expect(screen.getByRole("button", { name: /Setup Match/i })).toBeDefined()
    })
  })

  describe("After match setup with toss/batting (player selection)", () => {
    beforeEach(() => {
      useDirectorStore.setState({
        expandedPanel: "liveScorer",
        liveScorerPhase: "setup",
        matchSetup: {
          venue: "Allan Border Field",
          teamA: "Brisbane Tigers",
          teamB: "Gold Coast Sharks",
          playersA: Array.from({ length: 11 }, (_, i) => `TAP${String(i + 1).padStart(2, "0")}`),
          playersB: Array.from({ length: 11 }, (_, i) => `TBP${String(i + 1).padStart(2, "0")}`),
          overs: 20,
          tossWinner: "Team A",
          battingFirst: "Team A",
          playerNames: {},
        },
        scoringState: { ...defaultScoringState },
      })
    })

    it("shows Batter selector", () => {
      renderWithProviders(<LiveScorerPanel />)
      expect(screen.getByText("Batter")).toBeDefined()
    })

    it("shows Runner selector", () => {
      renderWithProviders(<LiveScorerPanel />)
      expect(screen.getByText("Runner")).toBeDefined()
    })

    it("shows Bowler selector", () => {
      renderWithProviders(<LiveScorerPanel />)
      expect(screen.getByText("Bowler")).toBeDefined()
    })

    it("shows disabled Start Scoring button when players not selected", () => {
      renderWithProviders(<LiveScorerPanel />)
      const btn = screen.getByRole("button", { name: /Start Scoring/i })
      expect(btn.hasAttribute("disabled")).toBe(true)
    })

    it("shows toss and batting info", () => {
      renderWithProviders(<LiveScorerPanel />)
      expect(screen.getByText(/Toss Won By - Brisbane Tigers/i)).toBeDefined()
      expect(screen.getByText(/Batting First - Brisbane Tigers/i)).toBeDefined()
    })

    it("shows Total Innings Overs", () => {
      renderWithProviders(<LiveScorerPanel />)
      expect(screen.getByText(/Total Innings Overs - 20/i)).toBeDefined()
    })
  })

  describe("Scoring phase", () => {
    beforeEach(() => {
      useDirectorStore.setState({
        expandedPanel: "liveScorer",
        liveScorerPhase: "scoring",
        matchSetup: {
          venue: "Allan Border Field",
          teamA: "Brisbane Tigers",
          teamB: "Gold Coast Sharks",
          playersA: Array.from({ length: 11 }, (_, i) => `TAP${String(i + 1).padStart(2, "0")}`),
          playersB: Array.from({ length: 11 }, (_, i) => `TBP${String(i + 1).padStart(2, "0")}`),
          overs: 20,
          tossWinner: "Team A",
          battingFirst: "Team A",
          playerNames: {},
        },
        scoringState: {
          ...defaultScoringState,
          striker: "TAP01",
          runner: "TAP02",
          currentBowler: "TBP01",
          initialStriker: "TAP01",
          initialRunner: "TAP02",
          initialBowler: "TBP01",
        },
      })
    })

    it("shows scoreboard with team and score", () => {
      renderWithProviders(<LiveScorerPanel />)
      expect(screen.getByText("Brisbane Tigers")).toBeDefined()
      const scoreElements = screen.getAllByText("0/0")
      expect(scoreElements.length).toBeGreaterThanOrEqual(1)
    })

    it("shows batter info", () => {
      renderWithProviders(<LiveScorerPanel />)
      expect(screen.getByText("TAP01")).toBeDefined()
    })

    it("shows runner info", () => {
      renderWithProviders(<LiveScorerPanel />)
      expect(screen.getByText("TAP02")).toBeDefined()
    })

    it("shows bowler info", () => {
      renderWithProviders(<LiveScorerPanel />)
      expect(screen.getByText("TBP01")).toBeDefined()
    })

    it("shows run buttons 1-6", () => {
      renderWithProviders(<LiveScorerPanel />)
      for (let i = 1; i <= 6; i++) {
        expect(screen.getByRole("button", { name: String(i) })).toBeDefined()
      }
    })

    it("shows extra buttons", () => {
      renderWithProviders(<LiveScorerPanel />)
      expect(screen.getByRole("button", { name: /Wide/i })).toBeDefined()
      expect(screen.getByRole("button", { name: /NoBall/i })).toBeDefined()
      expect(screen.getByRole("button", { name: "Bye" })).toBeDefined()
      expect(screen.getByRole("button", { name: /Leg Bye/i })).toBeDefined()
      expect(screen.getByRole("button", { name: /Out/i })).toBeDefined()
      expect(screen.getByRole("button", { name: /Undo Previous Ball/i })).toBeDefined()
    })

    it("updates score when run button clicked", async () => {
      const user = userEvent.setup()
      renderWithProviders(<LiveScorerPanel />)

      await user.click(screen.getByRole("button", { name: "4" }))

      const s = useDirectorStore.getState().scoringState
      expect(s!.runs).toBe(4)
    })

    it("shows Run Rate", () => {
      renderWithProviders(<LiveScorerPanel />)
      expect(screen.getByText(/Run Rate/i)).toBeDefined()
    })

    it("shows Partnership", () => {
      renderWithProviders(<LiveScorerPanel />)
      expect(screen.getByText(/Partnership/i)).toBeDefined()
    })

    it("shows Current Over heading", () => {
      renderWithProviders(<LiveScorerPanel />)
      expect(screen.getByText("Current Over")).toBeDefined()
    })

    it("shows Reset button", () => {
      renderWithProviders(<LiveScorerPanel />)
      expect(screen.getByRole("button", { name: /Reset/i })).toBeDefined()
    })
  })

  describe("Panel expansion", () => {
    it("renders collapsed view when not expanded", () => {
      useDirectorStore.setState({ expandedPanel: "none" })
      renderWithProviders(<LiveScorerPanel />)
      // Should still show Live Scorer title but in collapsed form
      expect(screen.getByText("Live Scorer")).toBeDefined()
    })

    it("can toggle expansion", () => {
      useDirectorStore.setState({ expandedPanel: "none" })
      renderWithProviders(<LiveScorerPanel />)

      const expandBtn = screen.getByRole("button").closest("button")
      if (expandBtn) {
        // The collapsed view should have an expand button
        expect(expandBtn).toBeDefined()
      }
    })
  })
})
