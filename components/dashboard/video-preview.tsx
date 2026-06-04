"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { mockPlayHQData, mockStreamStatus } from "@/lib/mock-data"
import { Radio, Volume2 } from "lucide-react"

export function VideoPreview() {
  const { battingTeam } = mockPlayHQData
  const { isLive } = mockStreamStatus

  return (
    <Card className="h-full bg-card/50 flex flex-col">
      <CardContent className="flex-1 p-0 relative">
        {/* Main Video Area */}
        <div className="absolute inset-0 bg-gradient-to-br from-zinc-900 to-zinc-950 rounded-lg overflow-hidden">
          {/* Simulated video background */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center space-y-4">
              <div className="w-24 h-24 mx-auto rounded-full bg-secondary/50 flex items-center justify-center">
                <Radio className="w-10 h-10 text-muted-foreground" />
              </div>
              <p className="text-muted-foreground text-sm">Live Preview</p>
              <p className="text-xs text-muted-foreground">Camera 1 - Main Pitch</p>
            </div>
          </div>

          {/* Score Overlay Preview */}
          <div className="absolute bottom-4 left-4 right-4">
            <div className="bg-zinc-900/90 backdrop-blur-sm rounded-lg p-3 border border-zinc-700/50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-400" />
                    <span className="text-sm font-medium tracking-tight text-white">{battingTeam.shortName}</span>
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-medium tracking-tight text-white">{battingTeam.score}</span>
                    <span className="text-lg text-zinc-400">/{battingTeam.wickets}</span>
                  </div>
                  <span className="text-sm text-zinc-400">
                    ({battingTeam.overs}.{battingTeam.balls})
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-xs text-zinc-400">RR: {battingTeam.runRate.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Status Indicators */}
          <div className="absolute top-4 left-4 flex items-center gap-2">
            {isLive ? (
              <Badge className="bg-red-500 text-white hover:bg-red-600">
                <span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
                LIVE
              </Badge>
            ) : (
              <Badge variant="secondary" className="bg-zinc-700 text-zinc-300">
                PREVIEW
              </Badge>
            )}
          </div>

          {/* Audio Indicator */}
          <div className="absolute top-4 right-4 flex items-center gap-2">
            <div className="flex items-center gap-1.5 bg-zinc-800/80 backdrop-blur-sm rounded px-2 py-1">
              <Volume2 className="w-3.5 h-3.5 text-emerald-400" />
              <div className="flex items-end gap-0.5 h-3">
                <div className="w-0.5 h-1 bg-emerald-400 rounded-full animate-pulse" />
                <div className="w-0.5 h-2 bg-emerald-400 rounded-full animate-pulse delay-75" />
                <div className="w-0.5 h-3 bg-emerald-400 rounded-full animate-pulse delay-150" />
                <div className="w-0.5 h-1.5 bg-emerald-400 rounded-full animate-pulse delay-100" />
              </div>
            </div>
          </div>

          {/* Timecode */}
          <div className="absolute bottom-4 right-4">
            <div className="bg-zinc-900/80 backdrop-blur-sm rounded px-2 py-1">
              <span className="font-mono text-xs text-zinc-400">00:18:34:12</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
