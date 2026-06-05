"use client"

import { useDirectorStore } from "@/store"
import { getOverlayModel, getDisplayName } from "@/services/cricket-scoring-engine"

export function ScoreOverlay() {
  const playhqScorecard = useDirectorStore((s) => s.playhqScorecard)
  const playhqConnectionStatus = useDirectorStore((s) => s.playhqConnectionStatus)
  const scoringState = useDirectorStore((s) => s.scoringState)
  const liveScorerPhase = useDirectorStore((s) => s.liveScorerPhase)
  const overlayVisible = useDirectorStore((s) => s.overlayVisible)
  const matchSetup = useDirectorStore((s) => s.matchSetup)
  const playerNames = matchSetup?.playerNames ?? {}

  if (!overlayVisible) return null

  // Priority: Live Scorer overlay > PlayHQ overlay
  if (liveScorerPhase === "scoring" && scoringState) {
    const model = getOverlayModel(scoringState)
    const [runs, wickets] = model.score.split("/")

    return (
      <div className="absolute bottom-3 left-3 right-3 z-10 pointer-events-none">
        <div className="inline-flex items-center gap-0 bg-black/75 backdrop-blur-md rounded-lg overflow-hidden border border-white/10">
          <div className="bg-blue-600 px-3 py-2 flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
            <span className="text-white text-sm font-semibold tracking-wide">
              {model.battingTeam.split(" ").pop()}
            </span>
          </div>
          <div className="px-3 py-2 flex items-baseline gap-1">
            <span className="text-white text-2xl font-bold tabular-nums">{runs}</span>
            <span className="text-white/60 text-lg">/{wickets}</span>
          </div>
          <div className="px-3 py-2 border-l border-white/10">
            <span className="text-white/70 text-sm tabular-nums">{model.overs}</span>
            <span className="text-white/40 text-xs ml-1">ov</span>
          </div>
          <div className="px-3 py-2 border-l border-white/10 hidden sm:flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <span className="text-white/50 text-xs">Bat</span>
              {model.striker && (
                <span className="text-white text-sm font-medium">{model.striker}</span>
              )}
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-white/50 text-xs">Bowl</span>
              {model.bowler && (
                <span className="text-white text-sm font-medium">{model.bowler}</span>
              )}
            </div>
          </div>
        </div>
        <div className="mt-1.5 inline-flex items-center gap-2 bg-black/50 backdrop-blur-sm rounded px-2.5 py-1 border border-white/5">
          <span className="text-white/60 text-xs">{model.bowlingTeam.split(" ").pop()}</span>
          {model.currentRunRate > 0 && (
            <span className="text-white/40 text-xs">RR {model.currentRunRate.toFixed(2)}</span>
          )}
          {model.target !== null && model.target > 0 && (
            <span className="text-amber-400 text-xs">Need {Math.max(0, model.target - scoringState.runs)}</span>
          )}
        </div>
      </div>
    )
  }

  // PlayHQ overlay
  if (playhqConnectionStatus !== "connected" || !playhqScorecard) return null

  const [runs, wickets] = playhqScorecard.innings.score.split("/")

  return (
    <div className="absolute bottom-3 left-3 right-3 z-10 pointer-events-none">
      <div className="inline-flex items-center gap-0 bg-black/75 backdrop-blur-md rounded-lg overflow-hidden border border-white/10">
        <div className="bg-emerald-600 px-3 py-2 flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
          <span className="text-white text-sm font-semibold tracking-wide">
            {playhqScorecard.homeTeam.split(" ").pop()}
          </span>
        </div>
        <div className="px-3 py-2 flex items-baseline gap-1">
          <span className="text-white text-2xl font-bold tabular-nums">{runs}</span>
          <span className="text-white/60 text-lg">/{wickets}</span>
        </div>
        <div className="px-3 py-2 border-l border-white/10">
          <span className="text-white/70 text-sm tabular-nums">{playhqScorecard.innings.overs}</span>
          <span className="text-white/40 text-xs ml-1">ov</span>
        </div>
        <div className="px-3 py-2 border-l border-white/10 hidden sm:flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="text-white/50 text-xs">Bat</span>
            <span className="text-white text-sm font-medium">{playhqScorecard.batter.name}</span>
            <span className="text-white/40 text-xs tabular-nums">{playhqScorecard.batter.runs}({playhqScorecard.batter.balls})</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-white/50 text-xs">Bowl</span>
            <span className="text-white text-sm font-medium">{playhqScorecard.bowler.name}</span>
            <span className="text-white/40 text-xs tabular-nums">{playhqScorecard.bowler.wickets}/{playhqScorecard.bowler.runsConceded}</span>
          </div>
        </div>
      </div>
      <div className="mt-1.5 inline-flex items-center gap-2 bg-black/50 backdrop-blur-sm rounded px-2.5 py-1 border border-white/5">
        <span className="text-white/60 text-xs">{playhqScorecard.awayTeam.split(" ").pop()}</span>
        <span className="text-white/40 text-xs">Yet to bat</span>
      </div>
    </div>
  )
}
