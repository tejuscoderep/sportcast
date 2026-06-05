"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select"
import { useDirectorStore } from "@/store"
import type { ScoringState, WicketType } from "@/types"
import { MatchSetupModal } from "./match-setup-modal"
import { ExtraRunsModal } from "./extra-runs-modal"
import { WicketModal } from "./wicket-modal"
import {
  scoreRuns,
  scoreWide,
  scoreNoBall,
  scoreByes,
  scoreLegByes,
  scoreWicket,
  undoLastBall,
  setStriker,
  setRunner,
  setCurrentBowler,
  formatOvers,
  getDisplayName,
} from "@/services/cricket-scoring-engine"
import { ClipboardList, RotateCcw, Dices, Minus, Plus } from "lucide-react"
import { useState } from "react"

export function LiveScorerPanel() {
  const phase = useDirectorStore((s) => s.liveScorerPhase)
  const matchSetup = useDirectorStore((s) => s.matchSetup)
  const scoringState = useDirectorStore((s) => s.scoringState)
  const setPhase = useDirectorStore((s) => s.setLiveScorerPhase)
  const startScoring = useDirectorStore((s) => s.startScoring)
  const setScoringState = useDirectorStore((s) => s.setScoringState)
  const resetScorer = useDirectorStore((s) => s.resetScorer)
  const gameType = useDirectorStore((s) => s.liveScorerGameType)
  const updatePlayerName = useDirectorStore((s) => s.updatePlayerName)
  const playerNames = matchSetup?.playerNames ?? {}

  const [extraModalType, setExtraModalType] = useState<string | null>(null)
  const [wicketModalOpen, setWicketModalOpen] = useState(false)

  const handleStartScoring = () => {
    if (!matchSetup) return
    if (!matchSetup.tossWinner || !matchSetup.battingFirst) return
    if (!scoringState?.striker || !scoringState?.runner || !scoringState?.currentBowler) return
    setPhase("scoring")
  }

  const handleScoreRuns = (runs: number) => {
    if (!scoringState) return
    const newState = scoreRuns(scoringState, runs)
    setScoringState(newState)
  }

  const handleExtraScore = (type: string, runs: number) => {
    if (!scoringState) return
    let newState: ScoringState
    switch (type) {
      case "wide":
        newState = scoreWide(scoringState, runs)
        break
      case "noBall":
        newState = scoreNoBall(scoringState, runs)
        break
      case "byes":
        newState = scoreByes(scoringState, runs)
        break
      case "legByes":
        newState = scoreLegByes(scoringState, runs)
        break
      default:
        return
    }
    setScoringState(newState)
    setExtraModalType(null)
  }

  const handleUndo = () => {
    if (!scoringState) return
    setScoringState(undoLastBall(scoringState))
  }

  const handleSelectStriker = (name: string) => {
    if (!scoringState) return
    setScoringState(setStriker(scoringState, name))
  }

  const handleSelectRunner = (name: string) => {
    if (!scoringState) return
    setScoringState(setRunner(scoringState, name))
  }

  const handleSelectBowler = (name: string) => {
    if (!scoringState) return
    setScoringState(setCurrentBowler(scoringState, name))
  }

  const handleWicketComplete = (wicketType: WicketType, fielder: string | null, newBatterName: string | null) => {
    if (!scoringState) return
    let newState = scoreWicket(scoringState, wicketType, fielder)
    if (newBatterName) {
      newState = setStriker(newState, newBatterName)
    }
    setScoringState(newState)
    setWicketModalOpen(false)
  }

  // Setup phase (no match setup saved yet)
  if (phase === "setup" && !matchSetup) {
    return (
      <Card className="bg-card/50">
        <CardHeader className="pb-2 pt-3 px-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium tracking-wide flex items-center gap-2">
              <ClipboardList className="w-4 h-4 text-blue-400" />
              Live Scorer
            </CardTitle>
            <Badge variant="outline" className="text-xs">{gameType}</Badge>
          </div>
        </CardHeader>
        <CardContent className="px-4 pb-3 space-y-2">
          <MatchSetupModal>
            <Button className="w-full gap-2 bg-emerald-600 hover:bg-emerald-700 text-white">
              <Dices className="w-4 h-4" />
              Setup Match
            </Button>
          </MatchSetupModal>
        </CardContent>
      </Card>
    )
  }

  // After setup saved but before scoring (show match details + Batter/Runner/Bowler selectors)
  if (matchSetup && (phase === "setup" || phase === "playerSelect")) {
    const tossTeamName = matchSetup.tossWinner
      ? (matchSetup.tossWinner === "Team A" ? matchSetup.teamA : matchSetup.teamB)
      : ""
    const battingTeamName = matchSetup.battingFirst
      ? (matchSetup.battingFirst === "Team A" ? matchSetup.teamA : matchSetup.teamB)
      : ""
    const missingSetup = !matchSetup.tossWinner || !matchSetup.battingFirst
    const canStart = !missingSetup && scoringState?.striker && scoringState?.runner && scoringState?.currentBowler

    // Available players for batting team
    const battingPlayers = matchSetup.battingFirst === "Team B" ? matchSetup.playersB : matchSetup.playersA
    const bowlingPlayers = matchSetup.battingFirst === "Team B" ? matchSetup.playersA : matchSetup.playersB

    return (
      <Card className="bg-card/50">
        <CardHeader className="pb-2 pt-3 px-4">
          <CardTitle className="text-sm font-medium tracking-wide flex items-center gap-2">
            <ClipboardList className="w-4 h-4 text-blue-400" />
            Live Scorer
          </CardTitle>
        </CardHeader>
        <CardContent className="px-4 pb-3 space-y-2">
          {/* Match details */}
          <p className="text-sm font-medium text-foreground">
            {matchSetup.teamA} vs {matchSetup.teamB}
          </p>
          <div className="text-xs text-muted-foreground space-y-0.5">
            <p>{matchSetup.venue}</p>
            <p>Total Innings Overs - {matchSetup.overs}</p>
            <p>Toss Won By - {tossTeamName || "Not selected"}</p>
            <p>Batting First - {battingTeamName || "Not selected"}</p>
          </div>

          {missingSetup ? (
            <div className="pt-2">
              <MatchSetupModal>
                <Button variant="outline" className="w-full gap-2 text-xs">
                  Complete Setup
                </Button>
              </MatchSetupModal>
            </div>
          ) : (
            <div className="space-y-2.5 pt-2">
              {/* Batter selector */}
              <div className="space-y-1.5">
                <label className="text-xs text-muted-foreground">Batter</label>
                <Select value={scoringState?.striker ?? ""} onValueChange={handleSelectStriker}>
                  <SelectTrigger className="w-full text-xs h-7">
                    <SelectValue placeholder="Select batter" />
                  </SelectTrigger>
                  <SelectContent>
                    {battingPlayers
                      .filter((n) => n !== scoringState?.runner)
                      .map((name) => (
                        <SelectItem key={name} value={name}>{getDisplayName(name, playerNames)}</SelectItem>
                      ))}
                  </SelectContent>
                </Select>
                {scoringState?.striker && (
                  <PlayerNameInput playerId={scoringState.striker} currentName={playerNames[scoringState.striker]} onUpdate={updatePlayerName} />
                )}
              </div>

              {/* Runner selector */}
              <div className="space-y-1.5">
                <label className="text-xs text-muted-foreground">Runner</label>
                <Select value={scoringState?.runner ?? ""} onValueChange={handleSelectRunner}>
                  <SelectTrigger className="w-full text-xs h-7">
                    <SelectValue placeholder="Select runner" />
                  </SelectTrigger>
                  <SelectContent>
                    {battingPlayers
                      .filter((n) => n !== scoringState?.striker)
                      .map((name) => (
                        <SelectItem key={name} value={name}>{getDisplayName(name, playerNames)}</SelectItem>
                      ))}
                  </SelectContent>
                </Select>
                {scoringState?.runner && (
                  <PlayerNameInput playerId={scoringState.runner} currentName={playerNames[scoringState.runner]} onUpdate={updatePlayerName} />
                )}
              </div>

              {/* Bowler selector */}
              <div className="space-y-1.5">
                <label className="text-xs text-muted-foreground">Bowler</label>
                <Select value={scoringState?.currentBowler ?? ""} onValueChange={handleSelectBowler}>
                  <SelectTrigger className="w-full text-xs h-7">
                    <SelectValue placeholder="Select bowler" />
                  </SelectTrigger>
                  <SelectContent>
                    {bowlingPlayers.map((name) => (
                      <SelectItem key={name} value={name}>{getDisplayName(name, playerNames)}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {scoringState?.currentBowler && (
                  <PlayerNameInput playerId={scoringState.currentBowler} currentName={playerNames[scoringState.currentBowler]} onUpdate={updatePlayerName} />
                )}
              </div>

              {/* Start Scoring button */}
              <Button
                className="w-full gap-2 text-white"
                disabled={!canStart}
                onClick={handleStartScoring}
                style={{ backgroundColor: canStart ? "#059669" : undefined }}
              >
                Start Scoring
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    )
  }

  // Scoring phase - expanded view
  if (phase === "scoring" && scoringState && matchSetup) {
    const striker = scoringState.batters.find((b) => b.name === scoringState.striker)
    const runner = scoringState.batters.find((b) => b.name === scoringState.runner)
    const bowler = scoringState.bowlers.find((b) => b.name === scoringState.currentBowler)

    const inningsOver = scoringState.inningsEnded

    return (
      <div className="flex flex-col gap-2 h-full">
        {/* Scoreboard */}
        <Card className="bg-card/50 shrink-0">
          <CardHeader className="pb-1 pt-2 px-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium tracking-wide flex items-center gap-2">
                <ClipboardList className="w-4 h-4 text-blue-400" />
                Live Scorer
              </CardTitle>
              <Button variant="ghost" size="xs" onClick={resetScorer} className="text-xs text-muted-foreground">
                <RotateCcw className="w-3 h-3" />
                Reset
              </Button>
            </div>
          </CardHeader>
          <CardContent className="px-3 pb-2 space-y-2">
            {/* Score */}
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-foreground">{scoringState.battingTeam}</p>
              <div className="text-right">
                <p className="text-2xl font-bold tabular-nums text-foreground">
                  {`${scoringState.runs}/${scoringState.wickets}`}
                </p>
                <p className="text-xs text-muted-foreground tabular-nums">
                  {formatOvers(scoringState)} Overs
                </p>
              </div>
            </div>

            {/* Target info for second innings */}
            {scoringState.isSecondInnings && scoringState.target > 0 && (
              <div className="text-xs text-amber-400">
                Target: {scoringState.target} | Need: {Math.max(0, scoringState.target - scoringState.runs)} | Balls left: {scoringState.ballsRemaining}
              </div>
            )}

            <Separator className="bg-border/50" />

            {/* Striker (Batter) */}
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Batter</p>
                {striker ? (
                  <p className="text-sm text-foreground">
                    {getDisplayName(striker.name, playerNames)} <span className="tabular-nums text-muted-foreground">{striker.runs} ({striker.balls})</span>
                  </p>
                ) : (
                  <p className="text-xs text-muted-foreground">Select new batter</p>
                )}
              </div>
            </div>

            {/* Runner */}
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Runner</p>
                {runner ? (
                  <p className="text-sm text-foreground">
                    {getDisplayName(runner.name, playerNames)} <span className="tabular-nums text-muted-foreground">{runner.runs} ({runner.balls})</span>
                  </p>
                ) : null}
              </div>
            </div>

            <Separator className="bg-border/50" />

            {/* Bowler */}
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Bowler</p>
                {bowler ? (
                  <p className="text-sm text-foreground">
                    {getDisplayName(bowler.name, playerNames)} <span className="tabular-nums text-muted-foreground">{bowler.wickets}/{bowler.runsConceded} ({bowler.balls})</span>
                  </p>
                ) : (
                  <p className="text-xs text-muted-foreground">Select bowler</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Innings ended message */}
        {inningsOver && (
          <Card className="bg-amber-500/10 border-amber-500/30 shrink-0">
            <CardContent className="p-3 text-center">
              <p className="text-sm font-medium text-amber-400">
                {scoringState.isSecondInnings ? "Match Over" : "Innings Break - Second Innings Starting"}
              </p>
              {scoringState.firstInningsScore !== null && (
                <p className="text-xs text-muted-foreground mt-1">
                  First Innings: {scoringState.firstInningsRuns}/{scoringState.firstInningsWickets} ({scoringState.firstInningsOvers}.{scoringState.firstInningsBalls})
                </p>
              )}
            </CardContent>
          </Card>
        )}

        {/* Scoring Controls */}
        {!inningsOver && (
          <Card className="bg-card/50 flex-1">
            <CardContent className="p-3 space-y-2">
              {/* Run buttons */}
              <div className="grid grid-cols-3 gap-1.5">
                {[1, 2, 3, 4, 5, 6].map((runs) => (
                  <Button
                    key={runs}
                    className={`h-10 text-sm font-semibold tabular-nums bg-emerald-600 text-white hover:bg-emerald-700`}
                    onClick={() => handleScoreRuns(runs)}
                  >
                    {runs}
                  </Button>
                ))}
              </div>

              {/* Extra buttons */}
              <div className="grid grid-cols-3 gap-1.5">
                <Button variant="outline" size="sm" className="text-xs h-9 bg-emerald-600/20 text-emerald-400 border-emerald-500/30 hover:bg-emerald-600/30" onClick={() => setExtraModalType("wide")}>
                  Wide
                </Button>
                <Button variant="outline" size="sm" className="text-xs h-9 bg-emerald-600/20 text-emerald-400 border-emerald-500/30 hover:bg-emerald-600/30" onClick={() => setExtraModalType("noBall")}>
                  NoBall
                </Button>
                <Button variant="outline" size="sm" className="text-xs h-9 bg-emerald-600/20 text-emerald-400 border-emerald-500/30 hover:bg-emerald-600/30" onClick={() => setExtraModalType("byes")}>
                  Bye
                </Button>
                <Button variant="outline" size="sm" className="text-xs h-9 bg-emerald-600/20 text-emerald-400 border-emerald-500/30 hover:bg-emerald-600/30" onClick={() => setExtraModalType("legByes")}>
                  Leg Bye
                </Button>
                <Button variant="destructive" size="sm" className="text-xs h-9" onClick={() => setWicketModalOpen(true)}>
                  Out
                </Button>
                <Button variant="outline" size="sm" className="text-xs h-9" onClick={handleUndo}>
                  Undo Previous Ball
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Extra Runs Modal */}
        {extraModalType && (
          <ExtraRunsModal
            type={extraModalType}
            onConfirm={handleExtraScore}
            onCancel={() => setExtraModalType(null)}
          />
        )}

        {/* Wicket Modal */}
        {wicketModalOpen && (
          <WicketModal
            scoringState={scoringState}
            playerNames={playerNames}
            onConfirm={handleWicketComplete}
            onCancel={() => setWicketModalOpen(false)}
            onUpdatePlayerName={updatePlayerName}
          />
        )}
      </div>
    )
  }

  return null
}

// Player name input component
function PlayerNameInput({ playerId, currentName, onUpdate }: {
  playerId: string
  currentName?: string
  onUpdate: (id: string, name: string) => void
}) {
  const [name, setName] = useState(currentName ?? "")

  const handleSave = () => {
    if (name.trim()) {
      onUpdate(playerId, name.trim())
    }
  }

  return (
    <div className="flex items-center gap-1.5">
      <span className="text-xs text-muted-foreground whitespace-nowrap">{playerId}</span>
      <Input
        className="h-6 text-xs flex-1"
        placeholder="Player name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        onBlur={handleSave}
        onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleSave() } }}
      />
    </div>
  )
}
