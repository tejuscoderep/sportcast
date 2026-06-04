"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  Video,
  VideoOff,
  Camera,
  CameraOff,
  Phone,
  PhoneOff,
  Wifi,
  WifiOff,
  RotateCcw,
} from "lucide-react"

type FacingMode = "user" | "environment"
type ConnectionState = "disconnected" | "connecting" | "connected" | "error"

export default function CameraPage() {
  const [cameraName, setCameraName] = useState("")
  const [roomName, setRoomName] = useState("sportcast-main")
  const [connectionState, setConnectionState] = useState<ConnectionState>("disconnected")
  const [facingMode, setFacingMode] = useState<FacingMode>("environment")
  const [hasPermission, setHasPermission] = useState<boolean | null>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)

  const startLocalPreview = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode, width: { ideal: 1920 }, height: { ideal: 1080 } },
        audio: true,
      })
      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
      }
      setHasPermission(true)
    } catch (err) {
      console.error("Camera access denied:", err)
      setHasPermission(false)
    }
  }, [facingMode])

  const stopLocalPreview = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop())
      streamRef.current = null
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null
    }
  }, [])

  useEffect(() => {
    startLocalPreview()
    return () => stopLocalPreview()
  }, [startLocalPreview, stopLocalPreview])

  const handleConnect = async () => {
    if (!cameraName.trim()) return
    setConnectionState("connecting")

    // Simulate LiveKit connection (real implementation would use livekit-client)
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500))
      setConnectionState("connected")
    } catch {
      setConnectionState("error")
    }
  }

  const handleDisconnect = () => {
    stopLocalPreview()
    setConnectionState("disconnected")
  }

  const flipCamera = async () => {
    const newMode = facingMode === "user" ? "environment" : "user"
    setFacingMode(newMode)
    stopLocalPreview()
    // Restart with new facing mode is handled by useEffect
    setTimeout(() => startLocalPreview(), 100)
  }

  const isConnected = connectionState === "connected"
  const isConnecting = connectionState === "connecting"

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="h-14 border-b border-border/50 bg-card/30 backdrop-blur-sm flex items-center px-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-blue-600 flex items-center justify-center">
            <Video className="w-4 h-4 text-white" />
          </div>
          <span className="text-lg font-medium tracking-tight text-foreground">SportCast Camera</span>
        </div>
      </header>

      <div className="flex-1 flex flex-col p-4 gap-4 max-w-lg mx-auto w-full">
        {/* Video Preview */}
        <Card className="bg-card/50 overflow-hidden">
          <CardContent className="p-0 relative">
            <div className="relative w-full aspect-video bg-zinc-900 rounded-t-xl overflow-hidden">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className={`w-full h-full object-cover ${facingMode === "user" ? "scale-x-[-1]" : ""}`}
              />
              {!hasPermission && (
                <div className="absolute inset-0 flex items-center justify-center bg-zinc-900">
                  <div className="text-center space-y-2">
                    <Camera className="w-8 h-8 text-zinc-600 mx-auto" />
                    <p className="text-zinc-500 text-sm">Camera preview</p>
                  </div>
                </div>
              )}

              {/* Connection status overlay */}
              <div className="absolute top-3 right-3">
                {isConnected ? (
                  <Badge className="bg-emerald-500 text-white gap-1.5 text-xs">
                    <Wifi className="w-3 h-3" />
                    Connected
                  </Badge>
                ) : isConnecting ? (
                  <Badge variant="secondary" className="gap-1.5 text-xs animate-pulse">
                    <Wifi className="w-3 h-3" />
                    Connecting
                  </Badge>
                ) : (
                  <Badge variant="secondary" className="text-xs">
                    <WifiOff className="w-3 h-3" />
                    Offline
                  </Badge>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Camera Controls */}
        <Card className="bg-card/50">
          <CardHeader className="pb-2 pt-3 px-4">
            <CardTitle className="text-sm font-medium">Camera Settings</CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4 space-y-3">
            <div>
              <label className="text-xs text-muted-foreground block mb-1.5">Camera Name</label>
              <Input
                placeholder="e.g. Camera 4 - Boundary"
                value={cameraName}
                onChange={(e) => setCameraName(e.target.value)}
                disabled={isConnected}
              />
            </div>

            <div>
              <label className="text-xs text-muted-foreground block mb-1.5">Room Name</label>
              <Input
                placeholder="sportcast-main"
                value={roomName}
                onChange={(e) => setRoomName(e.target.value)}
                disabled={isConnected}
              />
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <Card className="bg-card/50">
          <CardContent className="p-4 space-y-3">
            {/* Flip Camera */}
            <Button
              variant="outline"
              className="w-full gap-2"
              onClick={flipCamera}
              disabled={isConnecting}
            >
              <RotateCcw className="w-4 h-4" />
              {facingMode === "user" ? "Switch to Rear" : "Switch to Front"}
            </Button>

            {/* Connect / Disconnect */}
            {!isConnected ? (
              <Button
                className="w-full gap-2 bg-emerald-600 hover:bg-emerald-700 text-white"
                onClick={handleConnect}
                disabled={isConnecting || !cameraName.trim()}
              >
                {isConnecting ? (
                  <>
                    <Wifi className="w-4 h-4 animate-pulse" />
                    Connecting...
                  </>
                ) : (
                  <>
                    <Phone className="w-4 h-4" />
                    Connect
                  </>
                )}
              </Button>
            ) : (
              <Button
                variant="destructive"
                className="w-full gap-2"
                onClick={handleDisconnect}
              >
                <PhoneOff className="w-4 h-4" />
                Disconnect
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Status */}
        {hasPermission === false && (
          <Card className="border-red-500/30 bg-red-500/5">
            <CardContent className="p-4">
              <p className="text-red-400 text-sm">
                Camera access denied. Please allow camera permissions in your browser settings.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
