"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { mockPlayHQData } from "@/lib/mock-data"

export function ScorecardPanel() {
  const { match, battingTeam, currentBatsmen, currentBowler, recentBalls, partnership } = mockPlayHQData

  return (
    <div className="flex flex-col gap-3 h-full">
      {/* PlayHQ Header */}
      <Card className="border-emerald-500/30 bg-card/50">
        <CardHeader className="pb-2 pt-3 px-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-semibold text-emerald-400">PlayHQ Live</CardTitle>
            <Badge variant="outline" className="bg-emerald-500/20 text-emerald-400 border-emerald-500/50 text-xs">
              <span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              LIVE
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="px-4 pb-3">
          <p className="text-xs text-muted-foreground">{match.competition}</p>
          <p className="text-xs text-muted-foreground">{match.venue}</p>
        </CardContent>
      </Card>

      {/* Score Display */}
      <Card className="flex-1 bg-card/50">
        <CardContent className="p-4">
          {/* Team Names & Score */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-lg font-bold text-foreground">{battingTeam.name}</p>
                <p className="text-xs text-muted-foreground">Batting</p>
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold text-foreground">
                  {battingTeam.score}
                  <span className="text-xl text-muted-foreground">/{battingTeam.wickets}</span>
                </p>
                <p className="text-sm text-muted-foreground">
                  ({battingTeam.overs}.{battingTeam.balls} ov)
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">CRR:</span>
              <span className="text-sm font-medium text-foreground">{battingTeam.runRate.toFixed(2)}</span>
            </div>

            <Separator className="bg-border/50" />

            {/* Current Batsmen */}
            <div className="space-y-2">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Batsmen</p>
              {currentBatsmen.map((batsman) => (
                <div key={batsman.id} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    {batsman.isStriker && (
                      <span className="text-emerald-400 text-xs">*</span>
                    )}
                    <span className={batsman.isStriker ? "text-foreground font-medium" : "text-muted-foreground"}>
                      {batsman.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-xs">
                    <span className="font-medium text-foreground">{batsman.runs}</span>
                    <span className="text-muted-foreground">({batsman.balls})</span>
                  </div>
                </div>
              ))}
            </div>

            <Separator className="bg-border/50" />

            {/* Current Bowler */}
            <div className="space-y-2">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Bowler</p>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">{currentBowler.name}</span>
                <div className="flex items-center gap-3 text-xs">
                  <span className="font-medium text-foreground">{currentBowler.wickets}-{currentBowler.runs}</span>
                  <span className="text-muted-foreground">({currentBowler.overs} ov)</span>
                </div>
              </div>
            </div>

            <Separator className="bg-border/50" />

            {/* Recent Balls */}
            <div className="space-y-2">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">This Over</p>
              <div className="flex items-center gap-1.5">
                {recentBalls.map((ball, index) => (
                  <span
                    key={index}
                    className={`
                      w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium
                      ${ball === "W" ? "bg-red-500/20 text-red-400 border border-red-500/50" : ""}
                      ${ball === "4" ? "bg-blue-500/20 text-blue-400 border border-blue-500/50" : ""}
                      ${ball === "6" ? "bg-purple-500/20 text-purple-400 border border-purple-500/50" : ""}
                      ${ball === "0" ? "bg-muted text-muted-foreground" : ""}
                      ${!["W", "4", "6", "0"].includes(ball) ? "bg-secondary text-foreground" : ""}
                    `}
                  >
                    {ball}
                  </span>
                ))}
              </div>
            </div>

            {/* Partnership */}
            <div className="bg-secondary/50 rounded-lg p-3 mt-2">
              <p className="text-xs text-muted-foreground">Partnership</p>
              <p className="text-lg font-semibold text-foreground">
                {partnership.runs} <span className="text-sm text-muted-foreground">({partnership.balls} balls)</span>
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
