"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useDirectorStore } from "@/store"
import { ScoreOverlay } from "@/features/score-overlay"
import { Radio, Volume2, Video } from "lucide-react"

export function ProgramFeed() {
  const activeCameraId = useDirectorStore((s) => s.activeCameraId)
  const cameras = useDirectorStore((s) => s.cameras)
  const broadcastState = useDirectorStore((s) => s.broadcastState)

  const activeCamera = cameras.find((c) => c.id === activeCameraId)

  return (
    <Card className="h-full bg-card/50 flex flex-col overflow-hidden">
      <CardContent className="flex-1 p-0 relative">
        <div className="absolute inset-0 bg-gradient-to-br from-zinc-900 to-zinc-950 rounded-lg overflow-hidden">
          {/* Camera feed placeholder */}
          <div className="absolute inset-0 flex items-center justify-center">
            {activeCamera ? (
              <div className="text-center space-y-3">
                <div className="w-16 h-16 mx-auto rounded-full bg-blue-500/10 flex items-center justify-center ring-2 ring-blue-500/30">
                  <Video className="w-8 h-8 text-blue-400" />
                </div>
                <p className="text-white text-sm font-medium">{activeCamera.name}</p>
                <p className="text-zinc-500 text-xs">Camera feed active</p>
              </div>
            ) : (
              <div className="text-center space-y-3">
                <div className="w-16 h-16 mx-auto rounded-full bg-zinc-800 flex items-center justify-center">
                  <Radio className="w-8 h-8 text-zinc-600" />
                </div>
                <p className="text-zinc-500 text-sm">No camera selected</p>
                <p className="text-zinc-600 text-xs">Select a camera from the right panel</p>
              </div>
            )}
          </div>

          {/* Score Overlay */}
          <ScoreOverlay />

          {/* Live indicator */}
          <div className="absolute top-3 left-3 z-20">
            {broadcastState.status === "live" ? (
              <Badge className="bg-red-500 text-white hover:bg-red-600 text-xs py-0.5 px-2">
                <span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
                LIVE
              </Badge>
            ) : (
              <Badge variant="secondary" className="bg-zinc-800 text-zinc-400 text-xs py-0.5 px-2">
                PREVIEW
              </Badge>
            )}
          </div>

          {/* Audio indicator */}
          <div className="absolute top-3 right-3 z-20">
            <div className="flex items-center gap-1.5 bg-black/60 backdrop-blur-sm rounded px-2 py-1">
              <Volume2 className="w-3.5 h-3.5 text-emerald-400" />
              <div className="flex items-end gap-0.5 h-3">
                <div className="w-0.5 h-1 bg-emerald-400 rounded-full animate-pulse" />
                <div className="w-0.5 h-2 bg-emerald-400 rounded-full animate-pulse [animation-delay:75ms]" />
                <div className="w-0.5 h-3 bg-emerald-400 rounded-full animate-pulse [animation-delay:150ms]" />
                <div className="w-0.5 h-1.5 bg-emerald-400 rounded-full animate-pulse [animation-delay:100ms]" />
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
