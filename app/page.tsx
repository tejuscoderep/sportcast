import { DashboardHeader } from "@/components/dashboard/header"
import { ScorecardPanel } from "@/components/dashboard/scorecard-panel"
import { VideoPreview } from "@/components/dashboard/video-preview"
import { CameraPanel } from "@/components/dashboard/camera-panel"
import { StreamPanel } from "@/components/dashboard/stream-panel"

export default function DirectorDashboard() {
  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Header */}
      <DashboardHeader />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Main Dashboard Grid */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-[280px_1fr_280px] gap-3 p-3 overflow-hidden">
          {/* Left Panel - Scorecard */}
          <div className="hidden lg:flex flex-col overflow-y-auto">
            <ScorecardPanel />
          </div>

          {/* Center - Video Preview */}
          <div className="flex flex-col min-h-[300px] lg:min-h-0">
            <VideoPreview />
          </div>

          {/* Right Panel - Camera Controls */}
          <div className="hidden lg:flex flex-col overflow-y-auto">
            <CameraPanel />
          </div>
        </div>

        {/* Mobile: Scorecard & Camera in tabs/accordion could go here */}
        <div className="lg:hidden p-3 space-y-3 overflow-y-auto max-h-[50vh]">
          <details className="group">
            <summary className="flex items-center justify-between p-3 bg-card/50 rounded-lg cursor-pointer list-none">
              <span className="text-sm font-medium">Live Scorecard</span>
              <span className="text-muted-foreground text-xs group-open:rotate-180 transition-transform">▼</span>
            </summary>
            <div className="pt-3">
              <ScorecardPanel />
            </div>
          </details>
          <details className="group">
            <summary className="flex items-center justify-between p-3 bg-card/50 rounded-lg cursor-pointer list-none">
              <span className="text-sm font-medium">Camera Controls</span>
              <span className="text-muted-foreground text-xs group-open:rotate-180 transition-transform">▼</span>
            </summary>
            <div className="pt-3">
              <CameraPanel />
            </div>
          </details>
        </div>

        {/* Bottom Panel - Stream Status */}
        <div className="shrink-0 p-3 pt-0">
          <StreamPanel />
        </div>
      </div>
    </div>
  )
}
