"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import type { CameraDevice } from "@/types"
import {
  Video,
  BatteryMedium,
  Wifi,
  Radio,
  X,
} from "lucide-react"

interface CameraCardProps {
  camera: CameraDevice
  isActive: boolean
  onTakeLive: () => void
  onPreview: () => void
  onRemove: () => void
}

export function CameraCard({ camera, isActive, onTakeLive, onPreview, onRemove }: CameraCardProps) {
  const statusColor = {
    connected: "bg-emerald-400",
    connecting: "bg-amber-400",
    disconnected: "bg-zinc-500",
    error: "bg-red-400",
  }

  const batteryColor =
    camera.battery > 60 ? "text-emerald-400" : camera.battery > 25 ? "text-amber-400" : "text-red-400"

  const signalColor =
    camera.signal > 70 ? "text-emerald-400" : camera.signal > 40 ? "text-amber-400" : "text-red-400"

  return (
    <Card
      className={`
        transition-all duration-200 cursor-pointer
        ${isActive
          ? "border-blue-500/60 bg-blue-500/10 ring-1 ring-blue-500/30"
          : "bg-card/50 hover:bg-card/80 border-border/50"
        }
      `}
    >
      <CardContent className="p-3 space-y-2">
        {/* Video Thumbnail */}
        <div
          className="relative w-full aspect-video rounded-md bg-zinc-900 overflow-hidden"
          data-camera-preview={camera.id}
        >
          {/* Simulated camera feed placeholder */}
          <div className="absolute inset-0 flex items-center justify-center">
            <Video className="w-6 h-6 text-zinc-600" />
          </div>

          {/* ON AIR indicator */}
          {isActive && (
            <div className="absolute inset-0 bg-blue-500/15 flex items-center justify-center">
              <Badge className="bg-red-500 text-white gap-1 text-xs py-0.5 px-2">
                <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
                ON AIR
              </Badge>
            </div>
          )}

          {/* Camera name overlay */}
          <div className="absolute top-1.5 left-1.5">
            <Badge variant="secondary" className="bg-black/60 text-white/90 text-xs py-0 border-0">
              {camera.name}
            </Badge>
          </div>

          {/* Status dot & Remove */}
          <div className="absolute top-1.5 right-1.5 flex items-center gap-1">
            <span className={`w-2 h-2 rounded-full block ${statusColor[camera.status]}`} />
            <button
              className="w-4 h-4 rounded-full bg-black/60 flex items-center justify-center hover:bg-red-500/80 transition-colors"
              onClick={(e) => { e.stopPropagation(); onRemove() }}
            >
              <X className="w-2.5 h-2.5 text-white" />
            </button>
          </div>
        </div>

        {/* Camera Info */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <BatteryMedium className={`w-3.5 h-3.5 ${batteryColor}`} />
              <span className={batteryColor}>{camera.battery}%</span>
            </div>
            <div className="flex items-center gap-1">
              <Wifi className={`w-3.5 h-3.5 ${signalColor}`} />
              <span className={signalColor}>{camera.signal}%</span>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <Button
              size="xs"
              variant={isActive ? "default" : "secondary"}
              className={isActive ? "bg-blue-600 text-white hover:bg-blue-700" : ""}
              onClick={(e) => {
                e.stopPropagation()
                onTakeLive()
              }}
            >
              <Radio className="w-3 h-3" />
              {isActive ? "Live" : "Take"}
            </Button>
            <Button
              size="xs"
              variant="ghost"
              onClick={(e) => {
                e.stopPropagation()
                onPreview()
              }}
            >
              Preview
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
