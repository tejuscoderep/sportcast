import { describe, it, expect, beforeEach } from "vitest"
import {
  connect,
  getLiveMatches,
  getScorecard,
  setMockScenario,
  getMockScenario,
} from "@/services/playhq/index"
import type { MockScenario, PlayHQConnectionFields } from "@/types"

describe("playHQService", () => {
  const validFields: PlayHQConnectionFields = {
    tenant: "Cricket Queensland",
    clientId: "test-client-id",
    clientSecret: "test-client-secret",
    organisationId: "CQ12345",
  }

  beforeEach(() => {
    setMockScenario("multiple-matches")
  })

  describe("connect", () => {
    it("returns success for default scenario", async () => {
      const result = await connect(validFields)
      expect(result.connected).toBe(true)
      expect(result.tenant).toBe("Cricket Queensland")
      expect(result.organisationId).toBe("CQ12345")
    })

    it("returns failure for connection-failure scenario", async () => {
      setMockScenario("connection-failure")
      const result = await connect(validFields)
      expect(result.connected).toBe(false)
      expect(result.error).toBe("Unable to establish PlayHQ connection")
    })

    it("simulates latency between 1 and 2 seconds", async () => {
      const start = Date.now()
      await connect(validFields)
      const elapsed = Date.now() - start
      expect(elapsed).toBeGreaterThanOrEqual(900) // small margin
    })
  })

  describe("getLiveMatches", () => {
    it("returns single match for single-match scenario", async () => {
      setMockScenario("single-match")
      const matches = await getLiveMatches()
      expect(matches).toHaveLength(1)
      expect(matches[0].id).toBe("match-001")
      expect(matches[0].name).toBe("Brisbane Tigers vs Gold Coast Sharks")
    })

    it("returns multiple matches for multiple-matches scenario", async () => {
      setMockScenario("multiple-matches")
      const matches = await getLiveMatches()
      expect(matches.length).toBeGreaterThanOrEqual(2)
      expect(matches[0].name).toBe("Brisbane Tigers vs Gold Coast Sharks")
      expect(matches[1].name).toBe("Sunshine Coast vs Ipswich")
    })

    it("returns empty array for no-matches scenario", async () => {
      setMockScenario("no-matches")
      const matches = await getLiveMatches()
      expect(matches).toHaveLength(0)
    })

    it("returns empty array for connection-failure scenario", async () => {
      setMockScenario("connection-failure")
      const matches = await getLiveMatches()
      expect(matches).toHaveLength(0)
    })
  })

  describe("getScorecard", () => {
    it("returns scorecard for valid match ID", async () => {
      const scorecard = await getScorecard("match-001")
      expect(scorecard).not.toBeNull()
      expect(scorecard!.matchId).toBe("match-001")
      expect(scorecard!.homeTeam).toBe("Brisbane Tigers")
      expect(scorecard!.awayTeam).toBe("Gold Coast Sharks")
      expect(scorecard!.innings.score).toBe("145/3")
      expect(scorecard!.innings.overs).toBe("17.2")
      expect(scorecard!.batter.name).toBe("Carey")
      expect(scorecard!.batter.runs).toBe(45)
      expect(scorecard!.batter.balls).toBe(32)
      expect(scorecard!.bowler.name).toBe("Johnson")
      expect(scorecard!.bowler.wickets).toBe(2)
      expect(scorecard!.bowler.runsConceded).toBe(24)
    })

    it("returns scorecard for second match", async () => {
      const scorecard = await getScorecard("match-002")
      expect(scorecard).not.toBeNull()
      expect(scorecard!.matchId).toBe("match-002")
      expect(scorecard!.homeTeam).toBe("Sunshine Coast")
    })

    it("returns null for unknown match ID", async () => {
      const scorecard = await getScorecard("nonexistent")
      expect(scorecard).toBeNull()
    })
  })

  describe("setMockScenario / getMockScenario", () => {
    it("defaults to multiple-matches", () => {
      expect(getMockScenario()).toBe("multiple-matches")
    })

    it("can switch scenarios", () => {
      setMockScenario("no-matches")
      expect(getMockScenario()).toBe("no-matches")
      setMockScenario("single-match")
      expect(getMockScenario()).toBe("single-match")
    })
  })
})
