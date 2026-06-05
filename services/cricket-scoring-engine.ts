import type { ScoringState, BallEvent, BatterState, BowlerState, OverlayScoreModel, MatchSetupData } from "@/types"

export function createInitialScoringState(setup: MatchSetupData): ScoringState {
  const battingTeamName = setup.battingFirst === "Team B" ? setup.teamB : setup.teamA
  const bowlingTeamName = setup.battingFirst === "Team B" ? setup.teamA : setup.teamB
  const battingPlayers = setup.battingFirst === "Team B" ? setup.playersB : setup.playersA
  const bowlingPlayers = setup.battingFirst === "Team B" ? setup.playersA : setup.playersB

  return {
    runs: 0,
    wickets: 0,
    overs: 0,
    balls: 0,
    extras: 0,
    target: 0,
    battingTeam: battingTeamName,
    bowlingTeam: bowlingTeamName,
    striker: null,
    nonStriker: null,
    currentBowler: null,
    batters: battingPlayers.map((name) => ({
      name,
      runs: 0,
      balls: 0,
      isOut: false,
    })),
    bowlers: bowlingPlayers.map((name) => ({
      name,
      runsConceded: 0,
      wickets: 0,
      balls: 0,
    })),
    currentOverBalls: [],
    history: [],
    initialStriker: null,
    initialNonStriker: null,
    initialBowler: null,
  }
}

function rotateStrike(state: ScoringState): ScoringState {
  return {
    ...state,
    striker: state.nonStriker,
    nonStriker: state.striker,
  }
}

function incrementBall(state: ScoringState): ScoringState {
  let newBalls = state.balls + 1
  let newOvers = state.overs
  let newState = state

  if (newBalls >= 6) {
    newBalls = 0
    newOvers++
    // End of over: swap strike
    newState = rotateStrike(newState)
  }

  return { ...newState, balls: newBalls, overs: newOvers }
}

function updateBatter(state: ScoringState, name: string | null, runs: number, ballsFaced: number): ScoringState {
  if (!name) return state
  return {
    ...state,
    batters: state.batters.map((b) =>
      b.name === name ? { ...b, runs: b.runs + runs, balls: b.balls + ballsFaced } : b
    ),
  }
}

function updateBowler(state: ScoringState, name: string | null, runs: number, wicket: boolean): ScoringState {
  if (!name) return state
  return {
    ...state,
    bowlers: state.bowlers.map((b) =>
      b.name === name
        ? {
            ...b,
            runsConceded: b.runsConceded + runs,
            wickets: b.wickets + (wicket ? 1 : 0),
            balls: b.balls + 1,
          }
        : b
    ),
  }
}

export function scoreRuns(state: ScoringState, runs: number): ScoringState {
  const event: BallEvent = {
    type: "runs",
    runs,
    batter: state.striker ?? undefined,
    bowler: state.currentBowler ?? undefined,
    isExtra: false,
  }

  let newState = {
    ...state,
    runs: state.runs + runs,
    currentOverBalls: [...state.currentOverBalls, event],
    history: [...state.history, event],
  }

  newState = updateBatter(newState, state.striker, runs, 1)
  newState = updateBowler(newState, state.currentBowler, runs, false)
  newState = incrementBall(newState)

  // Rotate strike on odd runs
  if (runs % 2 === 1) {
    newState = rotateStrike(newState)
  }

  return newState
}

export function scoreWide(state: ScoringState, runs: number): ScoringState {
  const event: BallEvent = {
    type: "wide",
    runs,
    bowler: state.currentBowler ?? undefined,
    isExtra: true,
    extraType: "wide",
  }

  let newState = {
    ...state,
    runs: state.runs + runs,
    extras: state.extras + runs,
    currentOverBalls: [...state.currentOverBalls, event],
    history: [...state.history, event],
  }

  // Wide: 1 run to team + extra runs, bowler gets all runs conceded, no ball counted
  newState = updateBowler(newState, state.currentBowler, runs, false)

  return newState
}

export function scoreNoBall(state: ScoringState, runs: number): ScoringState {
  const event: BallEvent = {
    type: "noBall",
    runs,
    batter: state.striker ?? undefined,
    bowler: state.currentBowler ?? undefined,
    isExtra: true,
    extraType: "noBall",
  }

  let newState = {
    ...state,
    runs: state.runs + 1 + runs, // 1 for no ball + any batsman runs
    extras: state.extras + 1,
    currentOverBalls: [...state.currentOverBalls, event],
    history: [...state.history, event],
  }

  // Batsman runs go to batsman, all runs go against bowler
  if (runs > 0 && state.striker) {
    newState = updateBatter(newState, state.striker, runs, 0)
  }
  newState = updateBowler(newState, state.currentBowler, 1 + runs, false)

  // No ball does NOT rotate strike, no ball counted
  return newState
}

export function scoreByes(state: ScoringState, runs: number): ScoringState {
  const event: BallEvent = {
    type: "byes",
    runs,
    batter: state.striker ?? undefined,
    bowler: state.currentBowler ?? undefined,
    isExtra: true,
    extraType: "byes",
  }

  let newState = {
    ...state,
    runs: state.runs + runs,
    extras: state.extras + runs,
    currentOverBalls: [...state.currentOverBalls, event],
    history: [...state.history, event],
  }

  // Byes: ball counts, runs to extras, not to batter, bowler not charged
  newState = updateBatter(newState, state.striker, 0, 1)
  newState = incrementBall(newState)

  if (runs % 2 === 1) {
    newState = rotateStrike(newState)
  }

  return newState
}

export function scoreLegByes(state: ScoringState, runs: number): ScoringState {
  const event: BallEvent = {
    type: "legByes",
    runs,
    batter: state.striker ?? undefined,
    bowler: state.currentBowler ?? undefined,
    isExtra: true,
    extraType: "legByes",
  }

  let newState = {
    ...state,
    runs: state.runs + runs,
    extras: state.extras + runs,
    currentOverBalls: [...state.currentOverBalls, event],
    history: [...state.history, event],
  }

  newState = updateBatter(newState, state.striker, 0, 1)
  newState = incrementBall(newState)

  if (runs % 2 === 1) {
    newState = rotateStrike(newState)
  }

  return newState
}

export function scoreWicket(state: ScoringState): ScoringState {
  const dismissedBatter = state.striker
  const event: BallEvent = {
    type: "wicket",
    runs: 0,
    batter: dismissedBatter ?? undefined,
    bowler: state.currentBowler ?? undefined,
    isExtra: false,
    dismissedBatter: dismissedBatter ?? undefined,
  }

  let newState = {
    ...state,
    wickets: state.wickets + 1,
    currentOverBalls: [...state.currentOverBalls, event],
    history: [...state.history, event],
  }

  // Mark batter as out
  if (dismissedBatter) {
    newState = {
      ...newState,
      batters: newState.batters.map((b) =>
        b.name === dismissedBatter ? { ...b, isOut: true, balls: b.balls + 1 } : b
      ),
    }
  }

  // Wicket counts as a ball for the bowler
  newState = updateBowler(newState, state.currentBowler, 0, true)
  newState = incrementBall(newState)

  // Clear striker (new batter must be selected)
  newState = { ...newState, striker: null }

  return newState
}

export function undoLastBall(state: ScoringState): ScoringState {
  if (state.history.length === 0) return state

  // Rebuild state from scratch without last ball
  const previousHistory = state.history.slice(0, -1)
  let rebuiltState: ScoringState = {
    ...state,
    runs: 0,
    wickets: 0,
    overs: 0,
    balls: 0,
    extras: 0,
    striker: state.initialStriker,
    nonStriker: state.initialNonStriker,
    currentBowler: state.initialBowler,
    batters: state.batters.map((b) => ({ ...b, runs: 0, balls: 0, isOut: false })),
    bowlers: state.bowlers.map((b) => ({ ...b, runsConceded: 0, wickets: 0, balls: 0 })),
    currentOverBalls: [],
    history: [],
  }

  // Re-apply all events except the last
  for (const event of previousHistory) {
    switch (event.type) {
      case "runs":
        rebuiltState = scoreRuns(rebuiltState, event.runs)
        break
      case "wide":
        rebuiltState = scoreWide(rebuiltState, event.runs)
        break
      case "noBall":
        rebuiltState = scoreNoBall(rebuiltState, event.runs)
        break
      case "byes":
        rebuiltState = scoreByes(rebuiltState, event.runs)
        break
      case "legByes":
        rebuiltState = scoreLegByes(rebuiltState, event.runs)
        break
      case "wicket":
        rebuiltState = scoreWicket(rebuiltState)
        break
    }
  }

  return rebuiltState
}

export function setStriker(state: ScoringState, name: string): ScoringState {
  // Capture initial striker on first assignment
  if (!state.initialStriker) {
    return { ...state, striker: name, initialStriker: name }
  }
  return { ...state, striker: name }
}

export function setNonStriker(state: ScoringState, name: string): ScoringState {
  // Capture initial non-striker on first assignment
  if (!state.initialNonStriker) {
    return { ...state, nonStriker: name, initialNonStriker: name }
  }
  return { ...state, nonStriker: name }
}

export function setCurrentBowler(state: ScoringState, name: string): ScoringState {
  // Capture initial bowler on first assignment
  if (!state.initialBowler) {
    return { ...state, currentBowler: name, initialBowler: name }
  }
  return { ...state, currentBowler: name }
}

export function getOverlayModel(state: ScoringState): OverlayScoreModel {
  const strikerBatter = state.batters.find((b) => b.name === state.striker)
  const currentBowlerState = state.bowlers.find((b) => b.name === state.currentBowler)
  const lastBall = state.history.length > 0 ? state.history[state.history.length - 1] : null

  return {
    battingTeam: state.battingTeam,
    bowlingTeam: state.bowlingTeam,
    score: `${state.runs}/${state.wickets}`,
    wickets: state.wickets,
    overs: `${state.overs}.${state.balls}`,
    striker: state.striker
      ? `${state.striker} ${strikerBatter?.runs ?? 0} (${strikerBatter?.balls ?? 0})`
      : null,
    nonStriker: state.nonStriker ?? null,
    bowler: state.currentBowler
      ? `${state.currentBowler} ${currentBowlerState?.wickets ?? 0}/${currentBowlerState?.runsConceded ?? 0}`
      : null,
    lastBall,
  }
}

export function formatOvers(state: ScoringState): string {
  return `${state.overs}.${state.balls}`
}
