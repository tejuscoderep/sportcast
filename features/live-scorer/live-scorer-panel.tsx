"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select"
import { useDirectorStore } from "@/store"
import type { ScoringState } from "@/types"
import { MatchSetupModal } from "./match-setup-modal"
import {
  scoreRuns,
  scoreWide,
  scoreNoBall,
  scoreByes,
  scoreLegByes,
  scoreWicket,
  undoLastBall,
  setStriker,
  setNonStriker,
  setCurrentBowler,
  formatOvers,
} from "@/services/cricket-scoring-engine"
import { ClipboardList, Dices, RotateCcw } from "lucide-react"
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

  const [extraRunsOpen, setExtraRunsOpen] = useState<string | null>(null)
  const [newBatterSelect, setNewBatterSelect] = useState(false)

  const handleStartScoring = () => {
    if (!matchSetup) return
    if (!matchSetup.tossWinner || !matchSetup.battingFirst) {
      // Reopen setup modal - handled by MatchSetupModal trigger
      return
    }
    startScoring()
  }

  const handleScoreRuns = (runs: number) => {
    if (!scoringState) return
    setScoringState(scoreRuns(scoringState, runs))
  }

  const handleExtra = (type: string, runs: number) => {
    if (!scoringState) return
    switch (type) {
      case "wide":
        setScoringState(scoreWide(scoringState, runs))
        break
      case "noBall":
        setScoringState(scoreNoBall(scoringState, runs))
        break
      case "byes":
        setScoringState(scoreByes(scoringState, runs))
        break
      case "legByes":
        setScoringState(scoreLegByes(scoringState, runs))
        break
    }
    setExtraRunsOpen(null)
  }

  const handleWicket = () => {
    if (!scoringState) return
    const newState = scoreWicket(scoringState)
    setScoringState(newState)
    setNewBatterSelect(true)
  }

  const handleUndo = () => {
    if (!scoringState) return
    setScoringState(undoLastBall(scoringState))
  }

  const handleSelectStriker = (name: string) => {
    if (!scoringState) return
    setScoringState(setStriker(scoringState, name))
  }

  const handleSelectNonStriker = (name: string) => {
    if (!scoringState) return
    setScoringState(setNonStriker(scoringState, name))
  }

  const handleSelectBowler = (name: string) => {
    if (!scoringState) return
    setScoringState(setCurrentBowler(scoringState, name))
  }

  const handleNewBatter = (name: string) => {
    if (!scoringState) return
    setScoringState(setStriker(scoringState, name))
    setNewBatterSelect(false)
  }

  // Available batters (not out, not already at crease)
  const availableBatters = scoringState?.batters
    .filter((b) => !b.isOut && b.name !== scoringState.nonStriker && b.name !== scoringState.striker)
    .map((b) => b.name) ?? []

  const availableBowlers = scoringState?.bowlers.map((b) => b.name) ?? []

  // Setup phase
  if (phase === "setup" && !matchSetup) {
    return (
      <Card className="bg-card/50">
        <CardHeader className="pb-2 pt-3 px-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium tracking-wide flex items-center gap-2">
              <ClipboardList className="w-4 h-4 text-blue-400" />
              Live Scorer
            </CardTitle>
            <Badge variant="outline" className="text-xs">
              {gameType}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="px-4 pb-3 space-y-2">
          <div className="space-y-1">
            <label className="text-xs text-muted-foreground block">Game Type</label>
            <Select value={gameType} disabled>
              <SelectTrigger className="w-full text-xs h-7">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Cricket">Cricket</SelectItem>
                <SelectItem value="Basketball">Basketball</SelectItem>
                <SelectItem value="Netball">Netball</SelectItem>
                <SelectItem value="AFL">AFL</SelectItem>
              </SelectContent>
            </Select>
          </div>
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

  // After setup saved but before scoring
  if (matchSetup && (phase === "setup" || phase === "playerSelect")) {
    const missingSetup = !matchSetup.tossWinner || !matchSetup.battingFirst
    return (
      <Card className="bg-card/50">
        <CardHeader className="pb-2 pt-3 px-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium tracking-wide flex items-center gap-2">
              <ClipboardList className="w-4 h-4 text-blue-400" />
              Live Scorer
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="px-4 pb-3 space-y-2">
          <p className="text-sm font-medium text-foreground">
            {matchSetup.teamA} vs {matchSetup.teamB}
          </p>
          <div className="text-xs text-muted-foreground space-y-0.5">
            <p>Venue: {matchSetup.venue}</p>
            <p>Toss Won By: {matchSetup.tossWinner ? (matchSetup.tossWinner === "Team A" ? matchSetup.teamA : matchSetup.teamB) : "No Data Available"}</p>
            <p>Batting First: {matchSetup.battingFirst ? (matchSetup.battingFirst === "Team A" ? matchSetup.teamA : matchSetup.teamB) : "No Data Available"}</p>
          </div>

          {phase === "playerSelect" ? (
            <PlayerSelectionControls
              scoringState={scoringState}
              matchSetup={matchSetup}
              onSelectStriker={handleSelectStriker}
              onSelectNonStriker={handleSelectNonStriker}
              onSelectBowler={handleSelectBowler}
              onStart={() => setPhase("scoring")}
            />
          ) : (
            <div className="space-y-2 pt-2">
              <Button
                className="w-full gap-2 bg-emerald-600 hover:bg-emerald-700 text-white"
                onClick={handleStartScoring}
              >
                Start Scoring
              </Button>
              {missingSetup && (
                <MatchSetupModal>
                  <Button variant="outline" className="w-full gap-2 text-xs">
                    Complete Setup
                  </Button>
                </MatchSetupModal>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    )
  }

  // Scoring phase
  if (phase === "scoring" && scoringState && matchSetup) {
    const striker = scoringState.batters.find((b) => b.name === scoringState.striker)
    const nonStriker = scoringState.batters.find((b) => b.name === scoringState.nonStriker)
    const bowler = scoringState.bowlers.find((b) => b.name === scoringState.currentBowler)

    return (
      <div className="flex flex-col gap-3">
        {/* Scoreboard */}
        <Card className="bg-card/50">
          <CardHeader className="pb-2 pt-3 px-4">
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
          <CardContent className="px-4 pb-3 space-y-3">
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

            <Separator className="bg-border/50" />

            {/* Striker */}
            <div className="space-y-1">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Striker</p>
              {striker ? (
                <p className="text-sm text-foreground">
                  {striker.name} <span className="tabular-nums text-muted-foreground">{striker.runs} ({striker.balls})</span>
                </p>
              ) : (
                <p className="text-xs text-muted-foreground">Select new batter</p>
              )}
            </div>

            {/* Non-Striker */}
            <div className="space-y-1">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Non-Striker</p>
              {nonStriker ? (
                <p className="text-sm text-foreground">
                  {nonStriker.name} <span className="tabular-nums text-muted-foreground">{nonStriker.runs} ({nonStriker.balls})</span>
                </p>
              ) : null}
            </div>

            <Separator className="bg-border/50" />

            {/* Bowler */}
            <div className="space-y-1">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Bowler</p>
              {bowler ? (
                <p className="text-sm text-foreground">
                  {bowler.name} <span className="tabular-nums text-muted-foreground">{bowler.wickets}/{bowler.runsConceded}</span>
                </p>
              ) : (
                <p className="text-xs text-muted-foreground">Select bowler</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* New Batter Selection (after wicket) */}
        {newBatterSelect && availableBatters.length > 0 && (
          <Card className="bg-card/50 border-amber-500/30">
            <CardContent className="p-3 space-y-2">
              <p className="text-xs font-medium text-amber-400">Select New Batter</p>
              <div className="flex flex-wrap gap-1">
                {availableBatters.map((name) => (
                  <Button key={name} size="xs" variant="outline" onClick={() => handleNewBatter(name)}>
                    {name}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Scoring Controls */}
        <Card className="bg-card/50">
          <CardContent className="p-3 space-y-2">
            {/* Run buttons */}
            <div className="grid grid-cols-4 gap-1.5">
              {[0, 1, 2, 3, 4, 5, 6].map((runs) => (
                <Button
                  key={runs}
                  variant={runs === 4 || runs === 6 ? "default" : "outline"}
                  className={`h-9 text-sm font-semibold tabular-nums ${runs === 4 ? "bg-blue-600 text-white hover:bg-blue-700" : runs === 6 ? "bg-emerald-600 text-white hover:bg-emerald-700" : ""}`}
                  onClick={() => handleScoreRuns(runs)}
                >
                  {runs}
                </Button>
              ))}
            </div>

            {/* Extra buttons */}
            <div className="grid grid-cols-3 gap-1.5">
              <Button variant="outline" size="sm" className="text-xs" onClick={() => setExtraRunsOpen("wide")}>
                Wide
              </Button>
              <Button variant="outline" size="sm" className="text-xs" onClick={() => setExtraRunsOpen("noBall")}>
                No Ball
              </Button>
              <Button variant="outline" size="sm" className="text-xs" onClick={() => setExtraRunsOpen("byes")}>
                Byes
              </Button>
              <Button variant="outline" size="sm" className="text-xs" onClick={() => setExtraRunsOpen("legByes")}>
                Leg Byes
              </Button>
              <Button variant="destructive" size="sm" className="text-xs" onClick={handleWicket}>
                Wicket
              </Button>
              <Button variant="outline" size="sm" className="text-xs" onClick={handleUndo}>
                Undo
              </Button>
            </div>

            {/* Extra runs selector */}
            {extraRunsOpen && (
              <div className="space-y-1.5 pt-1">
                <p className="text-xs text-muted-foreground">
                  {extraRunsOpen === "wide" ? "Wide runs" : extraRunsOpen === "noBall" ? "No Ball runs" : extraRunsOpen === "byes" ? "Byes runs" : "Leg Byes runs"}
                </p>
                <div className="flex gap-1.5">
                  {(extraRunsOpen === "wide" || extraRunsOpen === "noBall" ? [1, 2, 3, 4, 5] : [1, 2, 3, 4, 5, 6]).map((r) => (
                    <Button key={r} size="xs" variant="secondary" onClick={() => handleExtra(extraRunsOpen, r)}>
                      {r}
                    </Button>
                  ))}
                  <Button size="xs" variant="ghost" onClick={() => setExtraRunsOpen(null)}>
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    )
  }

  // Default: show setup
  return null
}

// Player Selection sub-component
function PlayerSelectionControls({
  scoringState,
  matchSetup,
  onSelectStriker,
  onSelectNonStriker,
  onSelectBowler,
  onStart,
}: {
  scoringState: ScoringState | null
  matchSetup: MatchSetupData
  onSelectStriker: (name: string) => void
  onSelectNonStriker: (name: string) => void
  onSelectBowler: (name: string) => void
  onStart: () => void
}) {
  if (!scoringState) return null

  const availableBatters = scoringState.batters
    .filter((b) => !b.isOut)
    .map((b) => b.name)

  const availableBowlers = scoringState.bowlers.map((b) => b.name)

  const canStart = scoringState.striker && scoringState.nonStriker && scoringState.currentBowler

  return (
    <div className="space-y-2.5 pt-2">
      <div className="space-y-1.5">
        <label className="text-xs text-muted-foreground">Striker</label>
        <Select value={scoringState.striker ?? ""} onValueChange={onSelectStriker}>
          <SelectTrigger className="w-full text-xs h-7">
            <SelectValue placeholder="Select striker" />
          </SelectTrigger>
          <SelectContent>
            {availableBatters
              .filter((n) => n !== scoringState.nonStriker)
              .map((name) => (
                <SelectItem key={name} value={name}>{name}</SelectItem>
              ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1.5">
        <label className="text-xs text-muted-foreground">Non-Striker</label>
        <Select value={scoringState.nonStriker ?? ""} onValueChange={onSelectNonStriker}>
          <SelectTrigger className="w-full text-xs h-7">
            <SelectValue placeholder="Select non-striker" />
          </SelectTrigger>
          <SelectContent>
            {availableBatters
              .filter((n) => n !== scoringState.striker)
              .map((name) => (
                <SelectItem key={name} value={name}>{name}</SelectItem>
              ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1.5">
        <label className="text-xs text-muted-foreground">Bowler</label>
        <Select value={scoringState.currentBowler ?? ""} onValueChange={onSelectBowler}>
          <SelectTrigger className="w-full text-xs h-7">
            <SelectValue placeholder="Select bowler" />
          </SelectTrigger>
          <SelectContent>
            {availableBowlers.map((name) => (
              <SelectItem key={name} value={name}>{name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Button
        className="w-full gap-2 bg-emerald-600 hover:bg-emerald-700 text-white"
        disabled={!canStart}
        onClick={onStart}
      >
        Begin Scoring
      </Button>
    </div>
  )
}
