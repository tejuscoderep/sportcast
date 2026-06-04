"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useDirectorStore } from "@/store"
import { Settings, Bell, User, Tv, Wifi, WifiOff } from "lucide-react"

export function DashboardHeader() {
  const matchData = useDirectorStore((s) => s.matchData)
  const livekitConnected = useDirectorStore((s) => s.livekitConnected)

  return (
    <header className="h-14 border-b border-border/50 bg-card/30 backdrop-blur-sm shrink-0">
      <div className="h-full px-4 flex items-center justify-between">
        {/* Logo & Title */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-blue-600 flex items-center justify-center">
              <Tv className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg font-medium tracking-tight text-foreground">SportCast</span>
          </div>
          <Badge variant="outline" className="text-xs hidden md:flex">
            Director Mode
          </Badge>
        </div>

        {/* Match Info */}
        {matchData && (
          <div className="hidden lg:flex items-center gap-2 text-sm text-muted-foreground">
            <span>{matchData.competition}</span>
            <span className="text-muted-foreground/40">|</span>
            <span>{matchData.venue}</span>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-2">
          {/* LiveKit Status */}
          <div className="flex items-center gap-1.5 mr-1">
            {livekitConnected ? (
              <Wifi className="w-4 h-4 text-emerald-400" />
            ) : (
              <WifiOff className="w-4 h-4 text-muted-foreground" />
            )}
          </div>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <Bell className="w-4 h-4 text-muted-foreground" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <Settings className="w-4 h-4 text-muted-foreground" />
          </Button>
          <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
            <User className="w-4 h-4 text-muted-foreground" />
          </div>
        </div>
      </div>
    </header>
  )
}
