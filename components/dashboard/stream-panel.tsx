"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { mockStreamPlatforms, mockStreamStatus, type StreamStatus } from "@/lib/mock-data"
import { 
  Radio, 
  Wifi, 
  MonitorPlay, 
  CircleStop,
  Youtube,
  Signal,
  Gauge
} from "lucide-react"

function FacebookIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
    </svg>
  )
}

export function StreamPanel() {
  const [streamStatus, setStreamStatus] = useState<StreamStatus>(mockStreamStatus)
  const [elapsedTime, setElapsedTime] = useState("00:00:00")

  const handleGoLive = () => {
    setStreamStatus(prev => ({ ...prev, isLive: true }))
  }

  const handleStopStream = () => {
    setStreamStatus(prev => ({ ...prev, isLive: false }))
    setElapsedTime("00:00:00")
  }

  return (
    <Card className="bg-card/50 border-t-2 border-t-zinc-700">
      <CardContent className="p-3">
        <div className="flex flex-col lg:flex-row items-start lg:items-center gap-4">
          {/* Stream Status */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              {streamStatus.isLive ? (
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
            </div>
            
            {streamStatus.isLive && (
              <div className="flex items-center gap-2 text-sm">
                <Radio className="w-4 h-4 text-red-400 animate-pulse" />
                <span className="font-mono text-foreground">{elapsedTime}</span>
              </div>
            )}
          </div>

          <Separator orientation="vertical" className="h-8 hidden lg:block" />

          {/* Platform Connections */}
          <div className="flex items-center gap-3">
            {mockStreamPlatforms.map((platform) => (
              <div 
                key={platform.id}
                className={`
                  flex items-center gap-2 px-3 py-1.5 rounded-lg
                  ${platform.isConnected 
                    ? "bg-secondary/50" 
                    : "bg-secondary/20 opacity-50"
                  }
                `}
              >
                {platform.id === "youtube" && (
                  <Youtube className={`w-4 h-4 ${platform.isConnected ? "text-red-500" : "text-muted-foreground"}`} />
                )}
                {platform.id === "facebook" && (
                  <FacebookIcon className={`w-4 h-4 ${platform.isConnected ? "text-blue-500" : "text-muted-foreground"}`} />
                )}
                <span className="text-xs font-medium text-foreground">{platform.name}</span>
                {platform.isConnected && (
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                )}
              </div>
            ))}
          </div>

          <Separator orientation="vertical" className="h-8 hidden lg:block" />

          {/* Stream Stats */}
          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-1.5">
              <Gauge className="w-3.5 h-3.5 text-muted-foreground" />
              <span className="text-muted-foreground">Bitrate:</span>
              <span className="font-medium text-foreground">{streamStatus.bitrate} kbps</span>
            </div>
            <div className="flex items-center gap-1.5">
              <MonitorPlay className="w-3.5 h-3.5 text-muted-foreground" />
              <span className="text-muted-foreground">{streamStatus.resolution}</span>
              <span className="text-muted-foreground">@</span>
              <span className="font-medium text-foreground">{streamStatus.fps}fps</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Wifi className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-emerald-400 font-medium">Stable</span>
            </div>
          </div>

          {/* Spacer */}
          <div className="flex-1" />

          {/* Stream Controls */}
          <div className="flex items-center gap-2 w-full lg:w-auto">
            {!streamStatus.isLive ? (
              <Button 
                onClick={handleGoLive}
                className="flex-1 lg:flex-none gap-2 bg-red-600 hover:bg-red-700 text-white"
              >
                <Radio className="w-4 h-4" />
                Go Live
              </Button>
            ) : (
              <Button 
                onClick={handleStopStream}
                variant="destructive"
                className="flex-1 lg:flex-none gap-2"
              >
                <CircleStop className="w-4 h-4" />
                Stop Stream
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
