"use client"

import { useDirectorStore } from "@/store"

export function ScoreOverlay() {
  const scorecard = useDirectorStore((s) => s.playhqScorecard)
  const overlayVisible = useDirectorStore((s) => s.overlayVisible)
  const connectionStatus = useDirectorStore((s) => s.playhqConnectionStatus)

  if (connectionStatus !== "connected" || !scorecard || !overlayVisible) return null

  const [runs, wickets] = scorecard.innings.score.split("/")

  return (
    <div className="absolute bottom-3 left-3 right-3 z-10 pointer-events-none">
      <div className="inline-flex items-center gap-0 bg-black/75 backdrop-blur-md rounded-lg overflow-hidden border border-white/10">
        {/* Team badge */}
        <div className="bg-emerald-600 px-3 py-2 flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
          <span className="text-white text-sm font-semibold tracking-wide">
            {scorecard.homeTeam.split(" ").pop()}
          </span>
        </div>

        {/* Score */}
        <div className="px-3 py-2 flex items-baseline gap-1">
          <span className="text-white text-2xl font-bold tabular-nums">{runs}</span>
          <span className="text-white/60 text-lg">/{wickets}</span>
        </div>

        {/* Overs */}
        <div className="px-3 py-2 border-l border-white/10">
          <span className="text-white/70 text-sm tabular-nums">
            {scorecard.innings.overs}
          </span>
          <span className="text-white/40 text-xs ml-1">ov</span>
        </div>

        {/* Batter/Bowler */}
        <div className="px-3 py-2 border-l border-white/10 hidden sm:flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="text-white/50 text-xs">Bat</span>
            <span className="text-white text-sm font-medium">{scorecard.batter.name}</span>
            <span className="text-white/40 text-xs tabular-nums">{scorecard.batter.runs}({scorecard.batter.balls})</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-white/50 text-xs">Bowl</span>
            <span className="text-white text-sm font-medium">{scorecard.bowler.name}</span>
            <span className="text-white/40 text-xs tabular-nums">{scorecard.bowler.wickets}/{scorecard.bowler.runsConceded}</span>
          </div>
        </div>
      </div>

      {/* Away team (secondary, small) */}
      <div className="mt-1.5 inline-flex items-center gap-2 bg-black/50 backdrop-blur-sm rounded px-2.5 py-1 border border-white/5">
        <span className="text-white/60 text-xs">{scorecard.awayTeam.split(" ").pop()}</span>
        <span className="text-white/40 text-xs">Yet to bat</span>
      </div>
    </div>
  )
}
