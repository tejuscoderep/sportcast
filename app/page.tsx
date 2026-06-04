"use client"

import { DashboardHeader } from "@/features/dashboard/header"
import { MatchInfoPanel } from "@/features/dashboard/match-info"
import { ProgramFeed } from "@/features/dashboard/program-feed"
import { CameraPanel } from "@/features/dashboard/camera-feed"
import { BroadcastPanel } from "@/features/dashboard/broadcast-controls"
import { useScoreProvider } from "@/hooks/use-score-provider"
import { useCameras } from "@/hooks/use-cameras"

export default function DirectorDashboard() {
  useScoreProvider()
  useCameras()

  return (
    <div className="h-screen flex flex-col bg-background">
      <DashboardHeader />

      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-[280px_1fr_280px] gap-3 p-3 overflow-hidden">
          <div className="hidden lg:flex flex-col overflow-y-auto">
            <MatchInfoPanel />
          </div>

          <div className="flex flex-col min-h-[300px] lg:min-h-0">
            <ProgramFeed />
          </div>

          <div className="hidden lg:flex flex-col overflow-y-auto">
            <CameraPanel />
          </div>
        </div>

        {/* Mobile accordions */}
        <div className="lg:hidden p-3 space-y-3 overflow-y-auto max-h-[50vh]">
          <details className="group" open>
            <summary className="flex items-center justify-between p-3 bg-card/50 rounded-lg cursor-pointer list-none">
              <span className="text-sm font-medium">Match Information</span>
              <span className="text-muted-foreground text-xs group-open:rotate-180 transition-transform">&#9660;</span>
            </summary>
            <div className="pt-3">
              <MatchInfoPanel />
            </div>
          </details>
          <details className="group">
            <summary className="flex items-center justify-between p-3 bg-card/50 rounded-lg cursor-pointer list-none">
              <span className="text-sm font-medium">Camera Controls</span>
              <span className="text-muted-foreground text-xs group-open:rotate-180 transition-transform">&#9660;</span>
            </summary>
            <div className="pt-3">
              <CameraPanel />
            </div>
          </details>
        </div>

        <div className="shrink-0 p-3 pt-0">
          <BroadcastPanel />
        </div>
      </div>
    </div>
  )
}
