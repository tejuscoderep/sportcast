"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { CameraCard } from "./camera-card"
import { useCameras } from "@/hooks/use-cameras"
import { Video, Plus } from "lucide-react"

export function CameraPanel() {
  const { cameras, activeCameraId, takeLive, previewCamera, addNewCamera, removeCamera } = useCameras()

  return (
    <div className="flex flex-col gap-3 h-full">
      {/* Header */}
      <Card className="bg-card/50">
        <CardHeader className="pb-2 pt-3 px-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium tracking-wide flex items-center gap-2">
              <Video className="w-4 h-4 text-blue-400" />
              Cameras
            </CardTitle>
            <Badge variant="outline" className="text-xs">
              {cameras.length} connected
            </Badge>
          </div>
        </CardHeader>
      </Card>

      {/* Camera Grid */}
      <div className="flex-1 overflow-y-auto space-y-2 pr-0.5">
        {cameras.map((camera) => (
          <CameraCard
            key={camera.id}
            camera={camera}
            isActive={camera.id === activeCameraId}
            onTakeLive={() => takeLive(camera.id)}
            onPreview={() => previewCamera(camera.id)}
            onRemove={() => removeCamera(camera.id)}
          />
        ))}

        {/* Add Camera Button */}
        <Button
          variant="outline"
          className="w-full gap-2 border-dashed text-muted-foreground hover:text-foreground"
          onClick={addNewCamera}
        >
          <Plus className="w-4 h-4" />
          Add Camera
        </Button>
      </div>
    </div>
  )
}
