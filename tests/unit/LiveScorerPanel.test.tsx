import { describe, it, expect, vi, beforeEach } from "vitest"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { LiveScorerPanel } from "@/features/live-scorer/live-scorer-panel"
import { TooltipProvider } from "@/components/ui/tooltip"
import { useDirectorStore } from "@/store"

function renderWithProviders(ui: React.ReactElement) {
  return render(<TooltipProvider>{ui}</TooltipProvider>)
}

describe("LiveScorerPanel", () => {
  beforeEach(() => {
    useDirectorStore.setState({
      liveScorerPhase: "setup",
      liveScorerGameType: "Cricket",
      matchSetup: null,
      scoringState: null,
    })
  })

  describe("Setup phase", () => {
    it("shows Live Scorer title", () => {
      renderWithProviders(<LiveScorerPanel />)
      expect(screen.getByText("Live Scorer")).toBeDefined()
    })

    it("shows Cricket as default game type", () => {
      renderWithProviders(<LiveScorerPanel />)
      const cricketElements = screen.getAllByText("Cricket")
      expect(cricketElements.length).toBeGreaterThanOrEqual(1)
    })

    it("shows Setup Match button", () => {
      renderWithProviders(<LiveScorerPanel />)
      expect(screen.getByRole("button", { name: /Setup Match/i })).toBeDefined()
    })
  })

  describe("After match setup saved (missing toss/batting)", () => {
    beforeEach(() => {
      useDirectorStore.setState({
        liveScorerPhase: "setup",
        matchSetup: {
          venue: "Allan Border Field",
          teamA: "Brisbane Tigers",
          teamB: "Gold Coast Sharks",
          playersA: Array.from({ length: 11 }, (_, i) => `TAP${String(i + 1).padStart(2, "0")}`),
          playersB: Array.from({ length: 11 }, (_, i) => `TBP${String(i + 1).padStart(2, "0")}`),
          overs: 20,
          tossWinner: "",
          battingFirst: "",
          playerNames: {},
        },
        scoringState: null,
      })
    })

    it("shows team names", () => {
      renderWithProviders(<LiveScorerPanel />)
      expect(screen.getByText(/Brisbane Tigers vs Gold Coast Sharks/i)).toBeDefined()
    })

    it("shows venue", () => {
      renderWithProviders(<LiveScorerPanel />)
      expect(screen.getByText(/Allan Border Field/i)).toBeDefined()
    })

    it("shows total innings overs", () => {
      renderWithProviders(<LiveScorerPanel />)
      expect(screen.getByText(/Total Innings Overs - 20/i)).toBeDefined()
    })

    it("shows Complete Setup button when toss/batting missing", () => {
      renderWithProviders(<LiveScorerPanel />)
      expect(screen.getByRole("button", { name: /Complete Setup/i })).toBeDefined()
    })
  })

  describe("After match setup with toss/batting (player selection)", () => {
    beforeEach(() => {
      useDirectorStore.setState({
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
        scoringState: {
          runs: 0,
          wickets: 0,
          overs: 0,
          balls: 0,
          extras: 0,
          target: 0,
          battingTeam: "Brisbane Tigers",
          bowlingTeam: "Gold Coast Sharks",
          striker: null,
          runner: null,
          currentBowler: null,
          batters: Array.from({ length: 11 }, (_, i) => ({
            name: `TAP${String(i + 1).padStart(2, "0")}`,
            runs: 0,
            balls: 0,
            isOut: false,
          })),
          bowlers: Array.from({ length: 11 }, (_, i) => ({
            name: `TBP${String(i + 1).padStart(2, "0")}`,
            runsConceded: 0,
            wickets: 0,
            balls: 0,
          })),
          currentOverBalls: [],
          history: [],
          initialStriker: null,
          initialRunner: null,
          initialBowler: null,
          inningsNumber: 1,
          firstInningsScore: null,
          firstInningsOvers: 0,
          firstInningsBalls: 0,
          firstInningsWickets: 0,
          firstInningsRuns: 0,
          isSecondInnings: false,
          ballsRemaining: 120,
          inningsEnded: false,
        },
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
  })

  describe("Scoring phase", () => {
    beforeEach(() => {
      useDirectorStore.setState({
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
          runs: 0,
          wickets: 0,
          overs: 0,
          balls: 0,
          extras: 0,
          target: 0,
          battingTeam: "Brisbane Tigers",
          bowlingTeam: "Gold Coast Sharks",
          striker: "TAP01",
          runner: "TAP02",
          currentBowler: "TBP01",
          batters: Array.from({ length: 11 }, (_, i) => ({
            name: `TAP${String(i + 1).padStart(2, "0")}`,
            runs: 0,
            balls: 0,
            isOut: false,
          })),
          bowlers: Array.from({ length: 11 }, (_, i) => ({
            name: `TBP${String(i + 1).padStart(2, "0")}`,
            runsConceded: 0,
            wickets: 0,
            balls: 0,
          })),
          currentOverBalls: [],
          history: [],
          initialStriker: "TAP01",
          initialRunner: "TAP02",
          initialBowler: "TBP01",
          inningsNumber: 1,
          firstInningsScore: null,
          firstInningsOvers: 0,
          firstInningsBalls: 0,
          firstInningsWickets: 0,
          firstInningsRuns: 0,
          isSecondInnings: false,
          ballsRemaining: 120,
          inningsEnded: false,
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

      const state = useDirectorStore.getState().scoringState
      expect(state!.runs).toBe(4)
    })

    it("shows Reset button", () => {
      renderWithProviders(<LiveScorerPanel />)
      expect(screen.getByRole("button", { name: /Reset/i })).toBeDefined()
    })
  })
})
