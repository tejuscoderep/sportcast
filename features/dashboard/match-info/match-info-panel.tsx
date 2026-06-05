"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select"
import { useDirectorStore } from "@/store"
import { usePlayHQConnection } from "@/hooks/use-playhq-connection"
import { PlayHQConnectionModal } from "@/features/playhq"
import { Tv, Plug } from "lucide-react"

export function MatchInfoPanel() {
  const connectionStatus = useDirectorStore((s) => s.playhqConnectionStatus)
  const liveMatches = useDirectorStore((s) => s.playhqLiveMatches)
  const selectedMatchId = useDirectorStore((s) => s.playhqSelectedMatchId)
  const scorecard = useDirectorStore((s) => s.playhqScorecard)
  const overlayVisible = useDirectorStore((s) => s.overlayVisible)
  const toggleOverlay = useDirectorStore((s) => s.toggleOverlay)
  const { selectMatch, disconnect } = usePlayHQConnection()

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
            {connectionStatus === "connected" ? (
              <Badge variant="outline" className="bg-emerald-500/20 text-emerald-400 border-emerald-500/50 text-xs">
                <span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-emerald-400" />
                Connected
              </Badge>
            ) : connectionStatus === "connecting" ? (
              <Badge variant="outline" className="bg-amber-500/20 text-amber-400 border-amber-500/50 text-xs">
                <span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse" />
                Connecting
              </Badge>
            ) : connectionStatus === "error" ? (
              <Badge variant="outline" className="bg-red-500/20 text-red-400 border-red-500/50 text-xs">
                <span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-red-400" />
                Error
              </Badge>
            ) : (
              <Badge variant="outline" className="bg-secondary/50 text-muted-foreground border-border text-xs">
                Not Connected
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="px-4 pb-3 space-y-2">
          {connectionStatus === "disconnected" && (
            <PlayHQConnectionModal>
              <Button className="w-full gap-2 bg-emerald-600 hover:bg-emerald-700 text-white">
                <Plug className="w-4 h-4" />
                Connect
              </Button>
            </PlayHQConnectionModal>
          )}
          {connectionStatus === "error" && (
            <PlayHQConnectionModal>
              <Button className="w-full gap-2 bg-emerald-600 hover:bg-emerald-700 text-white">
                <Plug className="w-4 h-4" />
                Retry Connection
              </Button>
            </PlayHQConnectionModal>
          )}
          {connectionStatus === "connected" && (
            <>
              {/* Match Selector */}
              <div className="space-y-1">
                <label className="text-xs text-muted-foreground block">Live Match</label>
                {liveMatches.length > 0 ? (
                  <Select
                    value={selectedMatchId ?? ""}
                    onValueChange={(id) => selectMatch(id)}
                  >
                    <SelectTrigger className="w-full text-xs h-7">
                      <SelectValue placeholder="Choose a match" />
                    </SelectTrigger>
                    <SelectContent>
                      {liveMatches.map((m) => (
                        <SelectItem key={m.id} value={m.id}>
                          {m.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <p className="text-xs text-muted-foreground italic">No live matches available</p>
                )}
              </div>
              <Button
                variant="ghost"
                size="xs"
                className="text-xs text-muted-foreground hover:text-foreground w-full"
                onClick={disconnect}
              >
                Disconnect
              </Button>
            </>
          )}
        </CardContent>
      </Card>

      {/* Scorecard */}
      {connectionStatus === "connected" && scorecard && (
        <Card className="flex-1 bg-card/50">
          <CardContent className="p-4 space-y-4">
            {/* Home Team */}
            <div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-lg font-semibold tracking-tight text-foreground">
                    {scorecard.homeTeam}
                  </p>
                  <p className="text-xs text-emerald-400">Batting</p>
                </div>
                <div className="text-right">
                  <p className="text-3xl font-bold tracking-tight text-foreground tabular-nums">
                    {scorecard.innings.score}
                  </p>
                  <p className="text-sm text-muted-foreground tabular-nums">
                    ({scorecard.innings.overs} ov)
                  </p>
                </div>
              </div>
            </div>

            <Separator className="bg-border/50" />

            {/* Away Team */}
            <div className="flex items-center justify-between">
              <p className="text-base font-medium text-muted-foreground">{scorecard.awayTeam}</p>
              <p className="text-sm text-muted-foreground">Yet to bat</p>
            </div>

            <Separator className="bg-border/50" />

            {/* Batter */}
            <div className="space-y-1">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Batter</p>
              <div className="flex items-center gap-2">
                <span className="text-emerald-400 text-sm">*</span>
                <span className="text-sm font-medium text-foreground">{scorecard.batter.name}</span>
                <span className="text-sm text-muted-foreground tabular-nums">
                  {scorecard.batter.runs} ({scorecard.batter.balls})
                </span>
              </div>
            </div>

            <Separator className="bg-border/50" />

            {/* Bowler */}
            <div className="space-y-1">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Bowler</p>
              <span className="text-sm font-medium text-foreground">{scorecard.bowler.name}</span>
              <span className="text-sm text-muted-foreground tabular-nums ml-2">
                {scorecard.bowler.wickets}/{scorecard.bowler.runsConceded}
              </span>
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
      )}

      {/* Placeholder when connected but no scorecard */}
      {connectionStatus === "connected" && !scorecard && liveMatches.length === 0 && (
        <Card className="bg-card/50">
          <CardContent className="p-4 text-center text-muted-foreground text-sm">
            No live matches available
          </CardContent>
        </Card>
      )}
    </div>
  )
}
