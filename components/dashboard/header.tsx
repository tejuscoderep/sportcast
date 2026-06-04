"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { mockPlayHQData } from "@/lib/mock-data"
import { Settings, Bell, User, Tv } from "lucide-react"

export function DashboardHeader() {
  const { match } = mockPlayHQData

  return (
    <header className="h-14 border-b border-border/50 bg-card/30 backdrop-blur-sm">
      <div className="h-full px-4 flex items-center justify-between">
        {/* Logo & Title */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-blue-600 flex items-center justify-center">
              <Tv className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg font-medium tracking-tight text-foreground">SportcastUI</span>
          </div>
          <Badge variant="outline" className="text-xs hidden md:flex">
            Director Mode
          </Badge>
        </div>

        {/* Match Info */}
        <div className="hidden lg:flex items-center gap-2 text-sm">
          <span className="text-muted-foreground">{match.competition}</span>
          <span className="text-muted-foreground">•</span>
          <span className="text-muted-foreground">{match.venue}</span>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
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
