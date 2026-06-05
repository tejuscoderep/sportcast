import type { ScoringState, ScoreEvent, OverlayScoreModel, MatchSetupData, WicketType, InningsPhase, BatterState, BowlerState } from "@/types"

let eventCounter = 0

function nextEventId(): string {
  return `evt_${++eventCounter}_${Date.now()}`
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
      fours: 0,
      sixes: 0,
      isOut: false,
    })),
    bowlers: bowlingPlayers.map((name) => ({
      name,
      runsConceded: 0,
      wickets: 0,
      balls: 0,
      maidens: 0,
    })),
    currentOverBalls: [],
    previousOverBalls: [],
    history: [],
    initialStriker: null,
    initialRunner: null,
    initialBowler: null,
    inningsNumber: 1,
    inningsPhase: "READY",
    firstInningsRuns: 0,
    firstInningsWickets: 0,
    firstInningsOvers: 0,
    firstInningsBalls: 0,
    isSecondInnings: false,
    ballsRemaining: totalBalls,
    partnership: 0,
  }
}

function rotateStrike(state: ScoringState): ScoringState {
  return { ...state, striker: state.runner, runner: state.striker }
}

function isOverComplete(state: ScoringState): boolean {
  return state.balls >= 6
}

function isMaidenOver(overBalls: ScoreEvent[]): boolean {
  if (overBalls.length === 0) return false
  return overBalls.every((e) => e.runs === 0 && e.eventType !== "wide" && e.eventType !== "noBall")
}

function completeOver(state: ScoringState): ScoringState {
  const justCompletedBalls = state.currentOverBalls
  const wasMaiden = isMaidenOver(justCompletedBalls)

  let newState = { ...state, balls: 0, overs: state.overs + 1, currentOverBalls: [], previousOverBalls: justCompletedBalls }

  // Track maiden for current bowler
  if (wasMaiden && state.currentBowler) {
    newState = {
      ...newState,
      bowlers: newState.bowlers.map((b) =>
        b.name === state.currentBowler ? { ...b, maidens: b.maidens + 1 } : b
      ),
    }
  }

  // End of over: swap strike
  newState = rotateStrike(newState)

  return newState
}

function checkInningsEnd(state: ScoringState, setup: MatchSetupData | null): ScoringState {
  const totalBalls = setup ? setup.overs * 6 : 999
  const totalBallsBowled = state.overs * 6 + state.balls
  const allOut = state.wickets >= 10
  const oversComplete = totalBallsBowled >= totalBalls

  if (!allOut && !oversComplete) return state

  if (state.inningsNumber === 1) {
    const secondSetup = setup
      ? { ...setup, battingFirst: setup.battingFirst === "Team A" ? "Team B" : "Team A" }
      : null

    if (!secondSetup) return { ...state, inningsPhase: "INNINGS_BREAK" }

    const secondInnings = createInitialScoringState(secondSetup)
    secondInnings.inningsNumber = 2
    secondInnings.inningsPhase = "INNINGS_2"
    secondInnings.isSecondInnings = true
    secondInnings.firstInningsRuns = state.runs
    secondInnings.firstInningsWickets = state.wickets
    secondInnings.firstInningsOvers = state.overs
    secondInnings.firstInningsBalls = state.balls
    secondInnings.target = state.runs + 1
    secondInnings.ballsRemaining = totalBalls
    secondInnings.partnership = 0

    return secondInnings
  }

  return { ...state, inningsPhase: "COMPLETED" }
}

function incrementBall(state: ScoringState): ScoringState {
  let newState = { ...state, balls: state.balls + 1, ballsRemaining: Math.max(0, state.ballsRemaining - 1) }

  if (newState.balls >= 6) {
    newState = completeOver(newState)
  }

  return newState
}

function updateBatter(state: ScoringState, name: string | null, runs: number, ballsFaced: number, fours: number = 0, sixes: number = 0): ScoringState {
  if (!name) return state
  return {
    ...state,
    batters: state.batters.map((b) =>
      b.name === name
        ? { ...b, runs: b.runs + runs, balls: b.balls + ballsFaced, fours: b.fours + fours, sixes: b.sixes + sixes }
        : b
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

function addPartnership(state: ScoringState, runs: number): ScoringState {
  return { ...state, partnership: state.partnership + runs }
}

function createEvent(state: ScoringState, eventType: ScoreEvent["eventType"], runs: number, extras: number, wicketType?: WicketType, fielder?: string): ScoreEvent {
  return {
    id: nextEventId(),
    timestamp: Date.now(),
    innings: state.inningsNumber,
    over: state.overs,
    ball: state.balls + 1,
    eventType,
    runs,
    extras,
    wicketType,
    fielder,
    batter: state.striker,
    bowler: state.currentBowler,
  }
}

export function scoreRuns(state: ScoringState, runs: number): ScoringState {
  const fours = runs === 4 ? 1 : 0
  const sixes = runs === 6 ? 1 : 0
  const event = createEvent(state, "runs", runs, 0)

  let newState = {
    ...state,
    runs: state.runs + runs,
    currentOverBalls: [...state.currentOverBalls, event],
    history: [...state.history, event],
    inningsPhase: state.inningsPhase === "READY" ? "INNINGS_1" : state.inningsPhase,
  }

  newState = updateBatter(newState, state.striker, runs, 1, fours, sixes)
  newState = updateBowler(newState, state.currentBowler, runs, false)
  newState = addPartnership(newState, runs)
  newState = incrementBall(newState)

  if (runs % 2 === 1) {
    newState = rotateStrike(newState)
  }

  return newState
}

export function scoreWide(state: ScoringState, extraRuns: number): ScoringState {
  const totalRuns = 1 + extraRuns
  const event = createEvent(state, "wide", extraRuns, totalRuns)

  let newState = {
    ...state,
    runs: state.runs + totalRuns,
    extras: state.extras + totalRuns,
    currentOverBalls: [...state.currentOverBalls, event],
    history: [...state.history, event],
    inningsPhase: state.inningsPhase === "READY" ? "INNINGS_1" : state.inningsPhase,
  }

  newState = updateBowler(newState, state.currentBowler, totalRuns, false, false)
  newState = addPartnership(newState, totalRuns)

  // No ball count increment for wides
  if (totalRuns % 2 === 1) {
    newState = rotateStrike(newState)
  }

  return newState
}

export function scoreNoBall(state: ScoringState, batsmanRuns: number): ScoringState {
  const totalRuns = 1 + batsmanRuns
  const fours = batsmanRuns === 4 ? 1 : 0
  const sixes = batsmanRuns === 6 ? 1 : 0
  const event = createEvent(state, "noBall", batsmanRuns, 1)

  let newState = {
    ...state,
    runs: state.runs + totalRuns,
    extras: state.extras + 1,
    currentOverBalls: [...state.currentOverBalls, event],
    history: [...state.history, event],
    inningsPhase: state.inningsPhase === "READY" ? "INNINGS_1" : state.inningsPhase,
  }

  // Batsman runs go to batsman
  if (batsmanRuns > 0 && state.striker) {
    newState = updateBatter(newState, state.striker, batsmanRuns, 0, fours, sixes)
  }
  // All runs against bowler, no ball counted
  newState = updateBowler(newState, state.currentBowler, totalRuns, false, false)
  newState = addPartnership(newState, totalRuns)

  // No ball does NOT rotate strike, no ball counted
  return newState
}

export function scoreByes(state: ScoringState, runs: number): ScoringState {
  const event = createEvent(state, "byes", runs, runs)

  let newState = {
    ...state,
    runs: state.runs + runs,
    extras: state.extras + runs,
    currentOverBalls: [...state.currentOverBalls, event],
    history: [...state.history, event],
    inningsPhase: state.inningsPhase === "READY" ? "INNINGS_1" : state.inningsPhase,
  }

  newState = updateBatter(newState, state.striker, 0, 1)
  newState = addPartnership(newState, runs)
  newState = incrementBall(newState)

  if (runs % 2 === 1) {
    newState = rotateStrike(newState)
  }

  return newState
}

export function scoreLegByes(state: ScoringState, runs: number): ScoringState {
  const event = createEvent(state, "legByes", runs, runs)

  let newState = {
    ...state,
    runs: state.runs + runs,
    extras: state.extras + runs,
    currentOverBalls: [...state.currentOverBalls, event],
    history: [...state.history, event],
    inningsPhase: state.inningsPhase === "READY" ? "INNINGS_1" : state.inningsPhase,
  }

  newState = updateBatter(newState, state.striker, 0, 1)
  newState = addPartnership(newState, runs)
  newState = incrementBall(newState)

  if (runs % 2 === 1) {
    newState = rotateStrike(newState)
  }

  return newState
}

export function scoreWicket(state: ScoringState, wicketType: WicketType, fielder: string | null = null): ScoringState {
  const dismissedBatter = state.striker
  const event = createEvent(state, "wicket", 0, 0, wicketType, fielder ?? undefined)

  let newState = {
    ...state,
    wickets: state.wickets + 1,
    currentOverBalls: [...state.currentOverBalls, event],
    history: [...state.history, event],
    inningsPhase: state.inningsPhase === "READY" ? "INNINGS_1" : state.inningsPhase,
  }

  // Mark batter as out and increment balls faced
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

  // Reset partnership, clear striker
  newState = { ...newState, partnership: 0, striker: null }

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
    batters: state.batters.map((b) => ({ ...b, runs: 0, balls: 0, fours: 0, sixes: 0, isOut: false })),
    bowlers: state.bowlers.map((b) => ({ ...b, runsConceded: 0, wickets: 0, balls: 0, maidens: 0 })),
    currentOverBalls: [],
    previousOverBalls: [],
    history: [],
    partnership: 0,
    ballsRemaining: state.isSecondInnings
      ? (state.firstInningsOvers * 6 + state.firstInningsBalls)
      : state.ballsRemaining + (state.overs * 6 + state.balls),
  }

  for (const event of previousHistory) {
    switch (event.eventType) {
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

// Derived calculations
export function getRunRate(state: ScoringState): number {
  const totalBalls = state.overs * 6 + state.balls
  if (totalBalls === 0) return 0
  return (state.runs / totalBalls) * 6
}

export function getRequiredRunRate(state: ScoringState): number | null {
  if (!state.isSecondInnings || state.target <= 0) return null
  const runsNeeded = state.target - state.runs
  if (runsNeeded <= 0) return 0
  if (state.ballsRemaining === 0) return Infinity
  return (runsNeeded / state.ballsRemaining) * 6
}

export function getBatterStrikeRate(batter: BatterState): number {
  if (batter.balls === 0) return 0
  return (batter.runs / batter.balls) * 100
}

export function getBowlerEconomy(bowler: BowlerState): number {
  const oversBowled = bowler.balls / 6
  if (oversBowled === 0) return 0
  return bowler.runsConceded / oversBowled
}

export function formatBowlerFigures(bowler: BowlerState): string {
  const overs = Math.floor(bowler.balls / 6)
  const balls = bowler.balls % 6
  return `${overs}.${balls}-${bowler.maidens}-${bowler.runsConceded}-${bowler.wickets}`
}

export function formatCurrentOver(events: ScoreEvent[]): string {
  return events.map((e) => {
    switch (e.eventType) {
      case "runs": return e.runs === 0 ? "0" : String(e.runs)
      case "wide": return e.extras > 1 ? `W+${e.extras - 1}` : "W"
      case "noBall": return e.runs > 0 ? `NB+${e.runs}` : "NB"
      case "byes": return `B${e.runs}`
      case "legByes": return `LB${e.runs}`
      case "wicket": return "Wk"
      default: return "?"
    }
  }).join(" ")
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
    currentRunRate: getRunRate(state),
    requiredRunRate: getRequiredRunRate(state),
    target: state.isSecondInnings ? state.target : null,
    partnership: state.partnership,
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
