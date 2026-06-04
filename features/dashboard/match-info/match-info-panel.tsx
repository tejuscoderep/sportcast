"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { useDirectorStore } from "@/store"
import { Switch } from "@/components/ui/switch"
import { Tv } from "lucide-react"

export function MatchInfoPanel() {
  const matchData = useDirectorStore((s) => s.matchData)
  const overlayVisible = useDirectorStore((s) => s.overlayVisible)
  const toggleOverlay = useDirectorStore((s) => s.toggleOverlay)

  if (!matchData) {
    return (
      <Card className="bg-card/50">
        <CardContent className="p-4 text-center text-muted-foreground text-sm">
          Waiting for score data...
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="flex flex-col gap-3 h-full">
      {/* PlayHQ Header */}
      <Card className="border-emerald-500/30 bg-card/50">
        <CardHeader className="pb-2 pt-3 px-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium tracking-wide text-emerald-400 flex items-center gap-2">
              <Tv className="w-4 h-4" />
              PlayHQ Live
            </CardTitle>
            <Badge variant="outline" className="bg-emerald-500/20 text-emerald-400 border-emerald-500/50 text-xs">
              <span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              LIVE
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="px-4 pb-3">
          <p className="text-xs text-muted-foreground">{matchData.competition}</p>
          <p className="text-xs text-muted-foreground">{matchData.venue}</p>
        </CardContent>
      </Card>

      {/* Match Details */}
      <Card className="flex-1 bg-card/50">
        <CardContent className="p-4 space-y-4">
          {/* Home Team */}
          <div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-lg font-semibold tracking-tight text-foreground">
                  {matchData.homeTeam}
                </p>
                <p className="text-xs text-emerald-400">Batting</p>
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold tracking-tight text-foreground tabular-nums">
                  {matchData.homeScore.split("/")[0]}
                  <span className="text-xl text-muted-foreground">/{matchData.wickets}</span>
                </p>
                <p className="text-sm text-muted-foreground tabular-nums">
                  ({matchData.overs} ov)
                </p>
              </div>
            </div>
          </div>

          <Separator className="bg-border/50" />

          {/* Away Team */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-base font-medium text-muted-foreground">{matchData.awayTeam}</p>
            </div>
            <p className="text-sm text-muted-foreground">Yet to bat</p>
          </div>

          <Separator className="bg-border/50" />

          {/* Current Batter */}
          <div className="space-y-1">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Batter</p>
            <div className="flex items-center gap-2">
              <span className="text-emerald-400 text-sm">*</span>
              <span className="text-sm font-medium text-foreground">{matchData.currentBatter}</span>
            </div>
          </div>

          <Separator className="bg-border/50" />

          {/* Current Bowler */}
          <div className="space-y-1">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Bowler</p>
            <span className="text-sm font-medium text-foreground">{matchData.currentBowler}</span>
          </div>

          <Separator className="bg-border/50" />

          {/* Overlay Toggle */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-foreground">Score Overlay</p>
              <p className="text-xs text-muted-foreground">Show on program feed</p>
            </div>
            <Switch
              checked={overlayVisible}
              onCheckedChange={toggleOverlay}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
