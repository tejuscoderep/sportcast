"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { mockCameraFeeds, type CameraFeed } from "@/lib/mock-data"
import { Camera, RotateCcw, Sparkles, Video } from "lucide-react"

export function CameraPanel() {
  const [cameras, setCameras] = useState<CameraFeed[]>(mockCameraFeeds)
  const [autoDirector, setAutoDirector] = useState(false)

  const handleCameraSwitch = (cameraId: string) => {
    setCameras(cameras.map(cam => ({
      ...cam,
      isActive: cam.id === cameraId
    })))
  }

  const activeCamera = cameras.find(cam => cam.isActive)

  return (
    <div className="flex flex-col gap-3 h-full">
      {/* Camera Header */}
      <Card className="bg-card/50">
        <CardHeader className="pb-2 pt-3 px-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium tracking-wide flex items-center gap-2">
              <Video className="w-4 h-4 text-blue-400" />
              Camera Control
            </CardTitle>
            <Badge variant="outline" className="text-xs">
              {activeCamera?.label}
            </Badge>
          </div>
        </CardHeader>
      </Card>

      {/* Camera Feeds */}
      <div className="flex-1 flex flex-col gap-2">
        {cameras.map((camera) => (
          <Card 
            key={camera.id}
            className={`
              cursor-pointer transition-all duration-200
              ${camera.isActive 
                ? "border-blue-500/50 bg-blue-500/10" 
                : "bg-card/50 hover:bg-card/80"
              }
            `}
            onClick={() => handleCameraSwitch(camera.id)}
          >
            <CardContent className="p-3">
              <div className="flex items-center gap-3">
                {/* Camera Preview Thumbnail */}
                <div className={`
                  w-20 h-14 rounded bg-zinc-800 flex items-center justify-center relative overflow-hidden
                  ${camera.isActive ? "ring-2 ring-blue-500" : ""}
                `}>
                  <Camera className="w-5 h-5 text-zinc-600" />
                  {camera.isActive && (
                    <div className="absolute inset-0 bg-blue-500/20 flex items-center justify-center">
                      <span className="text-xs font-medium tracking-wide text-blue-400">ON AIR</span>
                    </div>
                  )}
                </div>

                {/* Camera Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-foreground">{camera.name}</span>
                    <span className={`
                      w-1.5 h-1.5 rounded-full
                      ${camera.status === "online" ? "bg-emerald-400" : ""}
                      ${camera.status === "offline" ? "bg-red-400" : ""}
                      ${camera.status === "standby" ? "bg-amber-400" : ""}
                    `} />
                  </div>
                  <p className="text-xs text-muted-foreground truncate">{camera.label}</p>
                </div>

                {/* Switch Button */}
                <Button
                  size="sm"
                  variant={camera.isActive ? "default" : "secondary"}
                  className={`
                    h-8 px-3 text-xs
                    ${camera.isActive 
                      ? "bg-blue-600 hover:bg-blue-700 text-white" 
                      : ""
                    }
                  `}
                  onClick={(e) => {
                    e.stopPropagation()
                    handleCameraSwitch(camera.id)
                  }}
                >
                  {camera.isActive ? "Active" : "Switch"}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Separator className="bg-border/50" />

      {/* Auto Director & Replay */}
      <Card className="bg-card/50">
        <CardContent className="p-4 space-y-4">
          {/* Auto Director Toggle */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <div>
                <p className="text-sm font-medium text-foreground">Auto-Director</p>
                <p className="text-xs text-muted-foreground">AI camera switching</p>
              </div>
            </div>
            <Switch
              checked={autoDirector}
              onCheckedChange={setAutoDirector}
              className="data-[state=checked]:bg-amber-500"
            />
          </div>

          {/* Replay Button */}
          <Button 
            variant="outline" 
            className="w-full gap-2 border-purple-500/50 text-purple-400 hover:bg-purple-500/10 hover:text-purple-300"
          >
            <RotateCcw className="w-4 h-4" />
            Instant Replay
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
