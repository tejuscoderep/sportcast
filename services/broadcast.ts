import type { BroadcastService, BroadcastState } from "@/types"

const INITIAL_STATE: BroadcastState = {
  status: "offline",
  health: {
    bitrate: 6000,
    fps: 60,
    resolution: "1920x1080",
    droppedFrames: 0,
    connectionStatus: "stable",
  },
  duration: 0,
  platforms: [
    { id: "youtube", name: "YouTube", isConnected: true, status: "ready", viewers: 0 },
    { id: "facebook", name: "Facebook", isConnected: true, status: "ready", viewers: 0 },
  ],
}

export class MockBroadcastService implements BroadcastService {
  private currentState: BroadcastState = { ...INITIAL_STATE }
  private subscribers: Set<(state: BroadcastState) => void> = new Set()
  private durationInterval: ReturnType<typeof setInterval> | null = null
  private viewerInterval: ReturnType<typeof setInterval> | null = null

  async startBroadcast(): Promise<void> {
    this.currentState = {
      ...this.currentState,
      status: "live",
      duration: 0,
      platforms: this.currentState.platforms.map((p) => ({
        ...p,
        status: "streaming" as const,
        viewers: Math.floor(Math.random() * 500) + 100,
      })),
    }
    this.notifySubscribers()

    // Simulate duration counter
    this.durationInterval = setInterval(() => {
      this.currentState = {
        ...this.currentState,
        duration: this.currentState.duration + 1,
      }
      this.notifySubscribers()
    }, 1000)

    // Simulate viewer count fluctuations
    this.viewerInterval = setInterval(() => {
      this.currentState = {
        ...this.currentState,
        platforms: this.currentState.platforms.map((p) => ({
          ...p,
          viewers: Math.max(0, p.viewers + Math.floor(Math.random() * 20) - 8),
        })),
      }
      this.notifySubscribers()
    }, 3000)
  }

  async stopBroadcast(): Promise<void> {
    if (this.durationInterval) clearInterval(this.durationInterval)
    if (this.viewerInterval) clearInterval(this.viewerInterval)
    this.durationInterval = null
    this.viewerInterval = null

    this.currentState = {
      ...this.currentState,
      status: "offline",
      duration: 0,
      platforms: this.currentState.platforms.map((p) => ({
        ...p,
        status: "ready" as const,
        viewers: 0,
      })),
    }
    this.notifySubscribers()
  }

  getStatus(): BroadcastState {
    return this.currentState
  }

  subscribeToStatus(callback: (state: BroadcastState) => void): () => void {
    this.subscribers.add(callback)
    callback(this.currentState)
    return () => this.subscribers.delete(callback)
  }

  private notifySubscribers() {
    this.subscribers.forEach((cb) => cb({ ...this.currentState }))
  }
}

export function createBroadcastService(): BroadcastService {
  return new MockBroadcastService()
}
