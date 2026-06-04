"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { useBroadcastService } from "@/hooks/use-broadcast-service"
import { useFormatDuration } from "@/hooks/use-format-duration"
import {
  Radio,
  Wifi,
  MonitorPlay,
  CircleStop,
  Signal,
  Gauge,
} from "lucide-react"

function YoutubeIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
    </svg>
  )
}

function FacebookIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  )
}

export function BroadcastPanel() {
  const { broadcastState, startBroadcast, stopBroadcast } = useBroadcastService()
  const formatDuration = useFormatDuration()
  const isLive = broadcastState.status === "live"
  const isStarting = broadcastState.status === "starting"
  const isStopping = broadcastState.status === "stopping"

  const healthStatusColor = {
    stable: "text-emerald-400",
    unstable: "text-amber-400",
    disconnected: "text-red-400",
  }

  return (
    <Card className="bg-card/50 border-t-2 border-t-zinc-700">
      <CardContent className="p-3">
        <div className="flex flex-col lg:flex-row items-start lg:items-center gap-4">
          {/* Broadcast Status */}
          <div className="flex items-center gap-4">
            {isLive ? (
              <Badge className="bg-red-500 text-white hover:bg-red-600 gap-1.5 py-1 px-3">
                <span className="h-2 w-2 rounded-full bg-white animate-pulse" />
                LIVE
              </Badge>
            ) : (
              <Badge variant="secondary" className="gap-1.5 py-1 px-3">
                <Signal className="w-3 h-3" />
                OFFLINE
              </Badge>
            )}

            {isLive && (
              <div className="flex items-center gap-2 text-sm">
                <Radio className="w-4 h-4 text-red-400 animate-pulse" />
                <span className="font-mono text-foreground tabular-nums">
                  {formatDuration(broadcastState.duration)}
                </span>
              </div>
            )}
          </div>

          <Separator orientation="vertical" className="h-8 hidden lg:block" />

          {/* Platforms */}
          <div className="flex items-center gap-3">
            {broadcastState.platforms.map((platform) => (
              <div
                key={platform.id}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg ${
                  platform.isConnected ? "bg-secondary/50" : "bg-secondary/20 opacity-50"
                }`}
              >
                {platform.id === "youtube" && (
                  <YoutubeIcon
                    className={`w-4 h-4 ${platform.isConnected ? "text-red-500" : "text-muted-foreground"}`}
                  />
                )}
                {platform.id === "facebook" && (
                  <FacebookIcon
                    className={`w-4 h-4 ${platform.isConnected ? "text-blue-500" : "text-muted-foreground"}`}
                  />
                )}
                <span className="text-xs font-medium text-foreground">{platform.name}</span>
                {isLive && platform.isConnected && platform.viewers > 0 && (
                  <span className="text-xs text-muted-foreground">({platform.viewers})</span>
                )}
                {platform.isConnected && (
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                )}
              </div>
            ))}
          </div>

          <Separator orientation="vertical" className="h-8 hidden lg:block" />

          {/* Stream Health */}
          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-1.5">
              <Gauge className="w-3.5 h-3.5 text-muted-foreground" />
              <span className="text-muted-foreground">Bitrate:</span>
              <span className="font-medium text-foreground tabular-nums">
                {broadcastState.health.bitrate / 1000}k
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <MonitorPlay className="w-3.5 h-3.5 text-muted-foreground" />
              <span className="font-medium text-foreground">{broadcastState.health.resolution}</span>
              <span className="text-muted-foreground">@</span>
              <span className="font-medium text-foreground tabular-nums">{broadcastState.health.fps}fps</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Wifi className={`w-3.5 h-3.5 ${healthStatusColor[broadcastState.health.connectionStatus]}`} />
              <span className={`font-medium ${healthStatusColor[broadcastState.health.connectionStatus]}`}>
                {broadcastState.health.connectionStatus.charAt(0).toUpperCase() +
                  broadcastState.health.connectionStatus.slice(1)}
              </span>
            </div>
          </div>

          {/* Spacer */}
          <div className="flex-1" />

          {/* Controls */}
          <div className="flex items-center gap-2 w-full lg:w-auto">
            {!isLive ? (
              <Button
                onClick={startBroadcast}
                disabled={isStarting}
                className="flex-1 lg:flex-none gap-2 bg-red-600 hover:bg-red-700 text-white"
              >
                <Radio className="w-4 h-4" />
                {isStarting ? "Starting..." : "Start Broadcast"}
              </Button>
            ) : (
              <Button
                onClick={stopBroadcast}
                disabled={isStopping}
                variant="destructive"
                className="flex-1 lg:flex-none gap-2"
              >
                <CircleStop className="w-4 h-4" />
                {isStopping ? "Stopping..." : "Stop Broadcast"}
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
