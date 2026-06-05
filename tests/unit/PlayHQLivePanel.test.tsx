import { describe, it, expect, vi, beforeEach } from "vitest"
import { render, screen, waitFor, act } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { MatchInfoPanel } from "@/features/dashboard/match-info/match-info-panel"
import { TooltipProvider } from "@/components/ui/tooltip"
import { useDirectorStore } from "@/store"
import * as playhqService from "@/services/playhq/index"

function renderWithProviders(ui: React.ReactElement) {
  return render(<TooltipProvider>{ui}</TooltipProvider>)
}

describe("PlayHQLivePanel (MatchInfoPanel)", () => {
  beforeEach(() => {
    useDirectorStore.setState({
      playhqConnectionStatus: "disconnected",
      playhqTenant: null,
      playhqOrganisationId: null,
      playhqLiveMatches: [],
      playhqSelectedMatchId: null,
      playhqScorecard: null,
    })
    playhqService.setMockScenario("multiple-matches")
  })

  describe("Disconnected state", () => {
    it("shows Not Connected status", () => {
      renderWithProviders(<MatchInfoPanel />)
      expect(screen.getByText("Not Connected")).toBeDefined()
    })

    it("shows Connect button", () => {
      renderWithProviders(<MatchInfoPanel />)
      expect(screen.getByRole("button", { name: /^Connect$/i })).toBeDefined()
    })

    it("does not show match dropdown", () => {
      renderWithProviders(<MatchInfoPanel />)
      expect(screen.queryByText("Live Match")).toBeNull()
    })

    it("does not show scorecard", () => {
      renderWithProviders(<MatchInfoPanel />)
      expect(screen.queryByText("Batter")).toBeNull()
    })
  })

  describe("Connected state with single match", () => {
    beforeEach(() => {
      playhqService.setMockScenario("single-match")
      useDirectorStore.setState({
        playhqConnectionStatus: "connected",
        playhqTenant: "Cricket Queensland",
        playhqOrganisationId: "CQ12345",
        playhqLiveMatches: [
          { id: "match-001", name: "Brisbane Tigers vs Gold Coast Sharks" },
        ],
        playhqSelectedMatchId: "match-001",
        playhqScorecard: {
          matchId: "match-001",
          homeTeam: "Brisbane Tigers",
          awayTeam: "Gold Coast Sharks",
          innings: { score: "145/3", overs: "17.2" },
          batter: { name: "Carey", runs: 45, balls: 32 },
          bowler: { name: "Johnson", wickets: 2, runsConceded: 24 },
        },
      })
    })

    it("shows Connected status", () => {
      renderWithProviders(<MatchInfoPanel />)
      expect(screen.getByText("Connected")).toBeDefined()
    })

    it("shows Live Match label", () => {
      renderWithProviders(<MatchInfoPanel />)
      expect(screen.getByText("Live Match")).toBeDefined()
    })

    it("renders the scorecard with team names and stats", () => {
      renderWithProviders(<MatchInfoPanel />)
      expect(screen.getByText("Brisbane Tigers")).toBeDefined()
      expect(screen.getByText("Gold Coast Sharks")).toBeDefined()
      expect(screen.getByText("Carey")).toBeDefined()
      expect(screen.getByText("Johnson")).toBeDefined()
      expect(screen.getByText("145/3")).toBeDefined()
    })
  })

  describe("Connected state with multiple matches", () => {
    beforeEach(() => {
      useDirectorStore.setState({
        playhqConnectionStatus: "connected",
        playhqTenant: "Cricket Queensland",
        playhqOrganisationId: "CQ12345",
        playhqLiveMatches: [
          { id: "match-001", name: "Brisbane Tigers vs Gold Coast Sharks" },
          { id: "match-002", name: "Sunshine Coast vs Ipswich" },
        ],
        playhqSelectedMatchId: "match-001",
        playhqScorecard: {
          matchId: "match-001",
          homeTeam: "Brisbane Tigers",
          awayTeam: "Gold Coast Sharks",
          innings: { score: "145/3", overs: "17.2" },
          batter: { name: "Carey", runs: 45, balls: 32 },
          bowler: { name: "Johnson", wickets: 2, runsConceded: 24 },
        },
      })
    })

    it("shows Connected status", () => {
      renderWithProviders(<MatchInfoPanel />)
      expect(screen.getByText("Connected")).toBeDefined()
    })

    it("shows scorecard for selected match", () => {
      renderWithProviders(<MatchInfoPanel />)
      expect(screen.getByText("Brisbane Tigers")).toBeDefined()
      expect(screen.getByText("145/3")).toBeDefined()
    })
  })

  describe("Connected state with no matches", () => {
    beforeEach(() => {
      playhqService.setMockScenario("no-matches")
      useDirectorStore.setState({
        playhqConnectionStatus: "connected",
        playhqTenant: "Cricket Queensland",
        playhqOrganisationId: "CQ12345",
        playhqLiveMatches: [],
        playhqSelectedMatchId: null,
        playhqScorecard: null,
      })
    })

    it("shows no live matches message", () => {
      renderWithProviders(<MatchInfoPanel />)
      const noMatchEls = screen.getAllByText("No live matches available")
      expect(noMatchEls.length).toBeGreaterThanOrEqual(1)
    })

    it("does not show scorecard Batter section", () => {
      renderWithProviders(<MatchInfoPanel />)
      expect(screen.queryByText("Batter")).toBeNull()
    })
  })

  describe("Match selection updates scorecard", () => {
    it("updates scorecard when store state changes", () => {
      useDirectorStore.setState({
        playhqConnectionStatus: "connected",
        playhqTenant: "Cricket Queensland",
        playhqOrganisationId: "CQ12345",
        playhqLiveMatches: [
          { id: "match-001", name: "Brisbane Tigers vs Gold Coast Sharks" },
          { id: "match-002", name: "Sunshine Coast vs Ipswich" },
        ],
        playhqSelectedMatchId: "match-001",
        playhqScorecard: {
          matchId: "match-001",
          homeTeam: "Brisbane Tigers",
          awayTeam: "Gold Coast Sharks",
          innings: { score: "145/3", overs: "17.2" },
          batter: { name: "Carey", runs: 45, balls: 32 },
          bowler: { name: "Johnson", wickets: 2, runsConceded: 24 },
        },
      })

      const { rerender } = renderWithProviders(<MatchInfoPanel />)
      expect(screen.getByText("Brisbane Tigers")).toBeDefined()

      // Update store for match-002
      act(() => {
        useDirectorStore.setState({
          playhqSelectedMatchId: "match-002",
          playhqScorecard: {
            matchId: "match-002",
            homeTeam: "Sunshine Coast",
            awayTeam: "Ipswich",
            innings: { score: "89/1", overs: "12.4" },
            batter: { name: "Hughes", runs: 38, balls: 28 },
            bowler: { name: "Richardson", wickets: 1, runsConceded: 31 },
          },
        })
      })

      rerender(<TooltipProvider><MatchInfoPanel /></TooltipProvider>)

      expect(screen.getByText("Sunshine Coast")).toBeDefined()
      expect(screen.getByText("Hughes")).toBeDefined()
      expect(screen.getByText("89/1")).toBeDefined()
    })
  })
})
