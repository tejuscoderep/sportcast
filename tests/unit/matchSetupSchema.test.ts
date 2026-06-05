import { describe, it, expect } from "vitest"
import { matchSetupSchema } from "@/lib/schemas/matchSetupSchema"

describe("matchSetupSchema", () => {
  const validData = {
    venue: "Allan Border Field",
    teamA: "Brisbane Tigers",
    teamB: "Gold Coast Sharks",
    playersA: Array.from({ length: 11 }, (_, i) => `Player A${i + 1}`),
    playersB: Array.from({ length: 11 }, (_, i) => `Player B${i + 1}`),
    overs: 20,
    tossWinner: "",
    battingFirst: "",
  }

  describe("valid values", () => {
    it("accepts valid complete data", () => {
      const result = matchSetupSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })

    it("accepts data with toss and batting team", () => {
      const result = matchSetupSchema.safeParse({
        ...validData,
        tossWinner: "Team A",
        battingFirst: "Team B",
      })
      expect(result.success).toBe(true)
    })

    it("accepts data with playerNames", () => {
      const result = matchSetupSchema.safeParse({
        ...validData,
        playerNames: { "Player A1": "John" },
      })
      expect(result.success).toBe(true)
    })
  })

  describe("required fields", () => {
    it("rejects missing venue", () => {
      const { venue, ...without } = validData
      const result = matchSetupSchema.safeParse(without)
      expect(result.success).toBe(false)
    })

    it("rejects empty venue", () => {
      const result = matchSetupSchema.safeParse({ ...validData, venue: "" })
      expect(result.success).toBe(false)
    })

    it("rejects missing teamA", () => {
      const { teamA, ...without } = validData
      const result = matchSetupSchema.safeParse(without)
      expect(result.success).toBe(false)
    })

    it("rejects missing teamB", () => {
      const { teamB, ...without } = validData
      const result = matchSetupSchema.safeParse(without)
      expect(result.success).toBe(false)
    })

    it("rejects fewer than 11 players for Team A", () => {
      const result = matchSetupSchema.safeParse({
        ...validData,
        playersA: ["P1", "P2", "P3"],
      })
      expect(result.success).toBe(false)
      if (!result.success) {
        const error = result.error.issues.find((i) => i.path[0] === "playersA")
        expect(error?.message).toContain("11")
      }
    })

    it("rejects fewer than 11 players for Team B", () => {
      const result = matchSetupSchema.safeParse({
        ...validData,
        playersB: ["P1", "P2", "P3"],
      })
      expect(result.success).toBe(false)
    })

    it("rejects missing overs", () => {
      const { overs, ...without } = validData
      const result = matchSetupSchema.safeParse(without)
      expect(result.success).toBe(false)
    })

    it("rejects overs below minimum", () => {
      const result = matchSetupSchema.safeParse({ ...validData, overs: 0 })
      expect(result.success).toBe(false)
    })

    it("rejects overs above maximum", () => {
      const result = matchSetupSchema.safeParse({ ...validData, overs: 51 })
      expect(result.success).toBe(false)
    })
  })

  describe("optional fields", () => {
    it("accepts empty tossWinner", () => {
      const result = matchSetupSchema.safeParse({ ...validData, tossWinner: "" })
      expect(result.success).toBe(true)
    })

    it("accepts empty battingFirst", () => {
      const result = matchSetupSchema.safeParse({ ...validData, battingFirst: "" })
      expect(result.success).toBe(true)
    })

    it("accepts missing playerNames", () => {
      const result = matchSetupSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })
  })
})
