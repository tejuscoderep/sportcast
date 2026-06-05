import type {
  PlayHQConnectionFields,
  PlayHQConnectionResult,
  PlayHQLiveMatch,
  PlayHQScorecard,
  MockScenario,
} from "@/types"
import { MOCK_LIVE_MATCHES, MOCK_SCORECARDS } from "./mock-data"

const DEFAULT_SCENARIO: MockScenario = "multiple-matches"

let activeScenario: MockScenario = DEFAULT_SCENARIO

export function setMockScenario(scenario: MockScenario): void {
  activeScenario = scenario
}

export function getMockScenario(): MockScenario {
  return activeScenario
}

export async function connect(fields: PlayHQConnectionFields): Promise<PlayHQConnectionResult> {
  // Simulate API latency between 1 and 2 seconds
  const delay = 1000 + Math.random() * 1000
  await new Promise((resolve) => setTimeout(resolve, delay))

  if (activeScenario === "connection-failure") {
    return {
      connected: false,
      error: "Unable to establish PlayHQ connection",
    }
  }

  return {
    connected: true,
    tenant: fields.tenant,
    organisationId: fields.organisationId,
  }
}

export async function getLiveMatches(): Promise<PlayHQLiveMatch[]> {
  // Simulate small latency
  await new Promise((resolve) => setTimeout(resolve, 300))

  const matches = MOCK_LIVE_MATCHES[activeScenario]
  return matches ?? []
}

export async function getScorecard(matchId: string): Promise<PlayHQScorecard | null> {
  // Simulate small latency
  await new Promise((resolve) => setTimeout(resolve, 200))

  const scorecard = MOCK_SCORECARDS[matchId]
  return scorecard ?? null
}
