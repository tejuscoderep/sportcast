import { describe, it, expect, vi, beforeEach } from "vitest"
import { render, screen, waitFor, act } from "@testing-library/react"
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

  describe("After match setup saved", () => {
    beforeEach(() => {
      useDirectorStore.setState({
        liveScorerPhase: "setup",
        matchSetup: {
          venue: "Allan Border Field",
          teamA: "Brisbane Tigers",
          teamB: "Gold Coast Sharks",
          playersA: Array.from({ length: 11 }, (_, i) => `TA${i + 1}`),
          playersB: Array.from({ length: 11 }, (_, i) => `TB${i + 1}`),
          overs: 20,
          tossWinner: "",
          battingFirst: "",
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

    it("shows No Data Available for missing toss", () => {
      renderWithProviders(<LiveScorerPanel />)
      const noDataElements = screen.getAllByText(/No Data Available/i)
      expect(noDataElements.length).toBeGreaterThanOrEqual(1)
    })

    it("shows Start Scoring button", () => {
      renderWithProviders(<LiveScorerPanel />)
      expect(screen.getByRole("button", { name: /Start Scoring/i })).toBeDefined()
    })

    it("shows Complete Setup button when toss/batting missing", () => {
      renderWithProviders(<LiveScorerPanel />)
      expect(screen.getByRole("button", { name: /Complete Setup/i })).toBeDefined()
    })
  })

  describe("Player selection phase", () => {
    beforeEach(() => {
      useDirectorStore.setState({
        liveScorerPhase: "playerSelect",
        matchSetup: {
          venue: "Allan Border Field",
          teamA: "Brisbane Tigers",
          teamB: "Gold Coast Sharks",
          playersA: Array.from({ length: 11 }, (_, i) => `TA${i + 1}`),
          playersB: Array.from({ length: 11 }, (_, i) => `TB${i + 1}`),
          overs: 20,
          tossWinner: "Team A",
          battingFirst: "Team A",
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
          nonStriker: null,
          currentBowler: null,
          batters: Array.from({ length: 11 }, (_, i) => ({
            name: `TA${i + 1}`,
            runs: 0,
            balls: 0,
            isOut: false,
          })),
          bowlers: Array.from({ length: 11 }, (_, i) => ({
            name: `TB${i + 1}`,
            runsConceded: 0,
            wickets: 0,
            balls: 0,
          })),
          currentOverBalls: [],
          history: [],
          initialStriker: null,
          initialNonStriker: null,
          initialBowler: null,
        },
      })
    })

    it("shows striker selector", () => {
      renderWithProviders(<LiveScorerPanel />)
      expect(screen.getByText("Striker")).toBeDefined()
    })

    it("shows non-striker selector", () => {
      renderWithProviders(<LiveScorerPanel />)
      expect(screen.getByText("Non-Striker")).toBeDefined()
    })

    it("shows bowler selector", () => {
      renderWithProviders(<LiveScorerPanel />)
      expect(screen.getByText("Bowler")).toBeDefined()
    })

    it("shows Begin Scoring button", () => {
      renderWithProviders(<LiveScorerPanel />)
      expect(screen.getByRole("button", { name: /Begin Scoring/i })).toBeDefined()
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
          playersA: Array.from({ length: 11 }, (_, i) => `TA${i + 1}`),
          playersB: Array.from({ length: 11 }, (_, i) => `TB${i + 1}`),
          overs: 20,
          tossWinner: "Team A",
          battingFirst: "Team A",
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
          striker: "TA1",
          nonStriker: "TA2",
          currentBowler: "TB1",
          batters: Array.from({ length: 11 }, (_, i) => ({
            name: `TA${i + 1}`,
            runs: 0,
            balls: 0,
            isOut: false,
          })),
          bowlers: Array.from({ length: 11 }, (_, i) => ({
            name: `TB${i + 1}`,
            runsConceded: 0,
            wickets: 0,
            balls: 0,
          })),
          currentOverBalls: [],
          history: [],
          initialStriker: "TA1",
          initialNonStriker: "TA2",
          initialBowler: "TB1",
        },
      })
    })

    it("shows scoreboard with team and score", () => {
      renderWithProviders(<LiveScorerPanel />)
      expect(screen.getByText("Brisbane Tigers")).toBeDefined()
      // Score appears in both the main score and bowler stats; check at least one exists
      const scoreElements = screen.getAllByText("0/0")
      expect(scoreElements.length).toBeGreaterThanOrEqual(1)
    })

    it("shows striker info", () => {
      renderWithProviders(<LiveScorerPanel />)
      expect(screen.getByText("TA1")).toBeDefined()
    })

    it("shows non-striker info", () => {
      renderWithProviders(<LiveScorerPanel />)
      expect(screen.getByText("TA2")).toBeDefined()
    })

    it("shows bowler info", () => {
      renderWithProviders(<LiveScorerPanel />)
      expect(screen.getByText("TB1")).toBeDefined()
    })

    it("shows run buttons 0-6", () => {
      renderWithProviders(<LiveScorerPanel />)
      for (let i = 0; i <= 6; i++) {
        expect(screen.getByRole("button", { name: String(i) })).toBeDefined()
      }
    })

    it("shows extra buttons", () => {
      renderWithProviders(<LiveScorerPanel />)
      expect(screen.getByRole("button", { name: /Wide/i })).toBeDefined()
      expect(screen.getByRole("button", { name: /No Ball/i })).toBeDefined()
      expect(screen.getByRole("button", { name: "Byes" })).toBeDefined()
      expect(screen.getByRole("button", { name: /Leg Byes/i })).toBeDefined()
      expect(screen.getByRole("button", { name: /Wicket/i })).toBeDefined()
      expect(screen.getByRole("button", { name: /Undo/i })).toBeDefined()
    })

    it("updates score when run button clicked", async () => {
      const user = userEvent.setup()
      renderWithProviders(<LiveScorerPanel />)

      await user.click(screen.getByRole("button", { name: "4" }))

      // Score should update via store
      const state = useDirectorStore.getState().scoringState
      expect(state!.runs).toBe(4)
    })

    it("shows Reset button", () => {
      renderWithProviders(<LiveScorerPanel />)
      expect(screen.getByRole("button", { name: /Reset/i })).toBeDefined()
    })
  })
})
