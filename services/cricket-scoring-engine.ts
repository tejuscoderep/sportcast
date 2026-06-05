import type { ScoringState, BallEvent, OverlayScoreModel, MatchSetupData, WicketType } from "@/types"

function generateDefaultPlayers(teamCode: string): string[] {
  return Array.from({ length: 11 }, (_, i) => `${teamCode}P${String(i + 1).padStart(2, "0")}`)
}

export function createInitialScoringState(setup: MatchSetupData): ScoringState {
  const battingTeamName = setup.battingFirst === "Team B" ? setup.teamB : setup.teamA
  const bowlingTeamName = setup.battingFirst === "Team B" ? setup.teamA : setup.teamB
  const battingPlayers = setup.battingFirst === "Team B" ? setup.playersB : setup.playersA
  const bowlingPlayers = setup.battingFirst === "Team B" ? setup.playersA : setup.playersB
  const totalBalls = setup.overs * 6

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
    runner: null,
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
    initialRunner: null,
    initialBowler: null,
    inningsNumber: 1,
    firstInningsScore: null,
    firstInningsOvers: 0,
    firstInningsBalls: 0,
    firstInningsWickets: 0,
    firstInningsRuns: 0,
    isSecondInnings: false,
    ballsRemaining: totalBalls,
    inningsEnded: false,
  }
}

function rotateStrike(state: ScoringState): ScoringState {
  return {
    ...state,
    striker: state.runner,
    runner: state.striker,
  }
}

function checkInningsEnd(state: ScoringState, setup: MatchSetupData | null): ScoringState {
  const totalBalls = setup ? setup.overs * 6 : 999
  const totalBallsBowled = state.overs * 6 + state.balls
  const allOut = state.wickets >= 10
  const oversComplete = totalBallsBowled >= totalBalls

  if (!allOut && !oversComplete) return state

  if (state.inningsNumber === 1) {
    // End first innings, start second
    const totalBallsForSecond = totalBalls
    const secondInningsSetup = setup
      ? {
          ...setup,
          battingFirst: setup.battingFirst === "Team A" ? "Team B" : "Team A",
        }
      : null

    if (!secondInningsSetup) return { ...state, inningsEnded: true }

    const secondInnings = createInitialScoringState(secondInningsSetup)
    secondInnings.inningsNumber = 2
    secondInnings.isSecondInnings = true
    secondInnings.firstInningsScore = state.runs
    secondInnings.firstInningsRuns = state.runs
    secondInnings.firstInningsWickets = state.wickets
    secondInnings.firstInningsOvers = state.overs
    secondInnings.firstInningsBalls = state.balls
    secondInnings.target = state.runs + 1
    secondInnings.ballsRemaining = totalBallsForSecond

    return { ...secondInnings, inningsEnded: false }
  }

  // Second innings ends
  return { ...state, inningsEnded: true }
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

  const newBallsRemaining = Math.max(0, state.ballsRemaining - 1)

  return { ...newState, balls: newBalls, overs: newOvers, ballsRemaining: newBallsRemaining }
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

function updateBowler(state: ScoringState, name: string | null, runs: number, wicket: boolean, countBall: boolean = true): ScoringState {
  if (!name) return state
  return {
    ...state,
    bowlers: state.bowlers.map((b) =>
      b.name === name
        ? {
            ...b,
            runsConceded: b.runsConceded + runs,
            wickets: b.wickets + (wicket ? 1 : 0),
            balls: countBall ? b.balls + 1 : b.balls,
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
    inningsEnded: false,
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

export function scoreWide(state: ScoringState, extraRuns: number): ScoringState {
  const totalRuns = 1 + extraRuns
  const event: BallEvent = {
    type: "wide",
    runs: extraRuns,
    bowler: state.currentBowler ?? undefined,
    isExtra: true,
    extraType: "wide",
  }

  let newState = {
    ...state,
    runs: state.runs + totalRuns,
    extras: state.extras + totalRuns,
    currentOverBalls: [...state.currentOverBalls, event],
    history: [...state.history, event],
    inningsEnded: false,
  }

  // Bowler gets all runs conceded, no ball counted
  newState = updateBowler(newState, state.currentBowler, totalRuns, false, false)

  // If total wide runs (1 + extra) is odd, rotate strike
  if (totalRuns % 2 === 1) {
    newState = rotateStrike(newState)
  }

  return newState
}

export function scoreNoBall(state: ScoringState, batsmanRuns: number): ScoringState {
  const totalRuns = 1 + batsmanRuns
  const event: BallEvent = {
    type: "noBall",
    runs: batsmanRuns,
    batter: state.striker ?? undefined,
    bowler: state.currentBowler ?? undefined,
    isExtra: true,
    extraType: "noBall",
  }

  let newState = {
    ...state,
    runs: state.runs + totalRuns,
    extras: state.extras + 1,
    currentOverBalls: [...state.currentOverBalls, event],
    history: [...state.history, event],
    inningsEnded: false,
  }

  // Batsman runs go to batsman, no ball counted
  if (batsmanRuns > 0 && state.striker) {
    newState = updateBatter(newState, state.striker, batsmanRuns, 0)
  }
  // All runs go against bowler, no ball counted for bowler
  newState = updateBowler(newState, state.currentBowler, totalRuns, false, false)

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
    inningsEnded: false,
  }

  // Byes: ball counts, runs to extras, not to batter
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
    inningsEnded: false,
  }

  newState = updateBatter(newState, state.striker, 0, 1)
  newState = incrementBall(newState)

  if (runs % 2 === 1) {
    newState = rotateStrike(newState)
  }

  return newState
}

export function scoreWicket(state: ScoringState, wicketType: WicketType, fielder: string | null = null): ScoringState {
  const dismissedBatter = state.striker
  const event: BallEvent = {
    type: "wicket",
    runs: 0,
    batter: dismissedBatter ?? undefined,
    bowler: state.currentBowler ?? undefined,
    isExtra: false,
    dismissedBatter: dismissedBatter ?? undefined,
    wicketType,
    fielder: fielder ?? undefined,
  }

  let newState = {
    ...state,
    wickets: state.wickets + 1,
    currentOverBalls: [...state.currentOverBalls, event],
    history: [...state.history, event],
    inningsEnded: false,
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

  const previousHistory = state.history.slice(0, -1)
  let rebuiltState: ScoringState = {
    ...state,
    runs: 0,
    wickets: 0,
    overs: 0,
    balls: 0,
    extras: 0,
    striker: state.initialStriker,
    runner: state.initialRunner,
    currentBowler: state.initialBowler,
    batters: state.batters.map((b) => ({ ...b, runs: 0, balls: 0, isOut: false })),
    bowlers: state.bowlers.map((b) => ({ ...b, runsConceded: 0, wickets: 0, balls: 0 })),
    currentOverBalls: [],
    history: [],
    inningsEnded: false,
    ballsRemaining: (state.isSecondInnings && state.firstInningsScore !== null)
      ? state.firstInningsOvers * 6 + state.firstInningsBalls + (state.overs * 6 + state.balls)
      : state.ballsRemaining + 1,
  }

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
        rebuiltState = scoreWicket(rebuiltState, event.wicketType ?? "bowled", event.fielder ?? null)
        break
    }
  }

  return rebuiltState
}

export function setStriker(state: ScoringState, name: string): ScoringState {
  if (!state.initialStriker) {
    return { ...state, striker: name, initialStriker: name }
  }
  return { ...state, striker: name }
}

export function setRunner(state: ScoringState, name: string): ScoringState {
  if (!state.initialRunner) {
    return { ...state, runner: name, initialRunner: name }
  }
  return { ...state, runner: name }
}

export function setCurrentBowler(state: ScoringState, name: string): ScoringState {
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
    nonStriker: state.runner ?? null,
    bowler: state.currentBowler
      ? `${state.currentBowler} ${currentBowlerState?.wickets ?? 0}/${currentBowlerState?.runsConceded ?? 0}`
      : null,
    lastBall,
  }
}

export function formatOvers(state: ScoringState): string {
  return `${state.overs}.${state.balls}`
}

export function getDisplayName(name: string, playerNames: Record<string, string>): string {
  const customName = playerNames[name]
  if (customName) return `${name} ${customName}`
  return name
}
