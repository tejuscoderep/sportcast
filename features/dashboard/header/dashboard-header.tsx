"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useDirectorStore } from "@/store"
import { Settings, Tv, BookOpen, MessageCircle } from "lucide-react"
import { SettingsDialog } from "./settings-dialog"
import { UserGuideDialog } from "./user-guide-dialog"
import { ContactUsPopover } from "./contact-us-popover"

export function DashboardHeader() {
  const matchData = useDirectorStore((s) => s.matchData)

  return (
    <header className="h-14 border-b border-border/50 bg-card/30 backdrop-blur-sm shrink-0">
      <div className="h-full px-4 flex items-center justify-between">
        {/* Logo & Title */}
        <div className="flex items-center gap-3">
          <div className="flex flex-col gap-0">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-blue-600 flex items-center justify-center">
                <Tv className="w-4 h-4 text-white" />
              </div>
              <span className="text-lg font-medium tracking-tight text-foreground">SportCast</span>
            </div>
          </div>
          <Badge variant="outline" className="text-xs hidden md:flex mt-0">
            Director Dashboard
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
        <div className="flex items-center gap-1">
          <SettingsDialog>
            <Button variant="ghost" size="icon-sm" className="h-8 w-8">
              <Settings className="w-4 h-4 text-muted-foreground" />
            </Button>
          </SettingsDialog>
          <UserGuideDialog>
            <Button variant="ghost" size="icon-sm" className="h-8 w-8">
              <BookOpen className="w-4 h-4 text-muted-foreground" />
            </Button>
          </UserGuideDialog>
          <ContactUsPopover>
            <Button variant="ghost" size="icon-sm" className="h-8 w-8">
              <MessageCircle className="w-4 h-4 text-muted-foreground" />
            </Button>
          </ContactUsPopover>
        </div>
      </div>
    </header>
  )
}
