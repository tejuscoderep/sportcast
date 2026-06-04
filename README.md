# SportCast - Live Streaming Director

A sports broadcasting dashboard for directing multi-camera live streams with cricket score overlays.

## Tech Stack

- Next.js 16.2 (App Router)
- TypeScript
- Tailwind CSS + shadcn/ui
- Zustand (state management)
- TanStack React Query
- LiveKit Client SDK

## Getting Started

```bash
npm install
npm run dev
```

Open http://localhost:3000 for the director dashboard or http://localhost:3000/camera for the mobile camera page.

## Environment Variables

Copy `.env.local` and fill in your LiveKit credentials:

```env
NEXT_PUBLIC_LIVEKIT_URL=wss://your-livekit-server.livekit.cloud
NEXT_PUBLIC_LIVEKIT_API_KEY=your-api-key
NEXT_PUBLIC_LIVEKIT_API_SECRET=your-api-secret
```

The app works with mock data without LiveKit configured — cameras are simulated and scores update every 5 seconds.

## Architecture

### Routes

| Route | Purpose |
|-------|---------|
| `/` | Director dashboard with match info, program feed, camera management, and broadcast controls |
| `/camera` | Mobile camera page for joining the broadcast room |

### File Structure

```
/app              - Next.js App Router pages
/components       - Shared UI components (shadcn/ui)
/features         - Feature-based components (dashboard, score-overlay)
/hooks            - Custom React hooks
/lib              - Utilities and LiveKit integration
/services         - Service abstractions (PlayHQ, Broadcast)
/store            - Zustand state
/types            - TypeScript type definitions
```

### Services

- **ScoreProvider** (`/services/playhq.ts`) - Abstraction for match scoring data. Mock provider simulates live score updates. Replace with PlayHQ API integration.
- **BroadcastService** (`/services/broadcast.ts`) - Abstraction for broadcasting. Mock provider simulates stream status. Add YouTube/Facebook RTMP by implementing the `BroadcastService` interface.
- **LiveKit** (`/lib/livekit/index.ts`) - Room management, camera track publishing/subscribing.

### State (Zustand)

The director store manages: active camera, connected cameras, match data, overlay visibility, broadcast state, and LiveKit connection.

### Key Features

- Unlimited camera support with a default 3-camera layout
- Dynamic camera grid that expands automatically
- Live cricket score overlay on program feed
- Simulated score updates every 5 seconds
- Broadcast start/stop controls with stream health indicators
- Mobile-responsive design
