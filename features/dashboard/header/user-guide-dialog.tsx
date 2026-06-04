"use client"

import { type ReactNode } from "react"
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion"

export function UserGuideDialog({ children }: { children: ReactNode }) {
  return (
    <Dialog>
      <DialogTrigger render={children} />
      <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>User Guide</DialogTitle>
          <DialogDescription>
            Setup instructions for integrating PlayHQ scoring and streaming platforms.
          </DialogDescription>
        </DialogHeader>

        <Accordion>
          <AccordionItem value="playhq">
            <AccordionTrigger>PlayHQ Scoring Integration</AccordionTrigger>
            <AccordionContent>
              <div className="space-y-3 text-muted-foreground">
                <p>1. Log in to your PlayHQ admin dashboard and navigate to the API settings page.</p>
                <p>2. Generate a new API key with read access to match scoring data.</p>
                <p>3. Copy the API URL endpoint provided by PlayHQ (typically https://api.playhq.com/v1).</p>
                <p>4. Open Settings in SportCast and paste the API URL and API Key into the PlayHQ fields.</p>
                <p>5. Save the settings. Live match data will automatically populate the score overlay once a match is detected.</p>
                <p>6. Use the match selector dropdown to switch between multiple live matches.</p>
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="youtube">
            <AccordionTrigger>YouTube Live Streaming</AccordionTrigger>
            <AccordionContent>
              <div className="space-y-3 text-muted-foreground">
                <p>1. Go to YouTube Studio (studio.youtube.com) and click &quot;Go Live&quot;.</p>
                <p>2. Set up your stream title, description, and privacy settings.</p>
                <p>3. Copy the Stream Key from the stream setup page.</p>
                <p>4. In Google Cloud Console, create an OAuth 2.0 Client ID with YouTube Live streaming permissions.</p>
                <p>5. Open Settings in SportCast and enter the Stream Key and Client ID in the YouTube fields.</p>
                <p>6. Save settings. When you click &quot;Start Broadcast&quot;, the stream will publish to your YouTube channel.</p>
                <p>7. Viewer counts and stream health metrics will display in the broadcast controls panel.</p>
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="facebook">
            <AccordionTrigger>Facebook Live Streaming</AccordionTrigger>
            <AccordionContent>
              <div className="space-y-3 text-muted-foreground">
                <p>1. Go to Facebook Live Producer (facebook.com/live/producer).</p>
                <p>2. Create a new live video and select &quot;Use Stream Key&quot; connection method.</p>
                <p>3. Copy the Stream Key from the connection settings.</p>
                <p>4. In Meta for Developers, create a Facebook App with Live Video API permissions.</p>
                <p>5. Open Settings in SportCast and enter the Stream Key and App ID in the Facebook fields.</p>
                <p>6. Save settings. Starting a broadcast will simultaneously stream to Facebook Live.</p>
                <p>7. Both YouTube and Facebook can stream simultaneously for multi-platform broadcasting.</p>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </DialogContent>
    </Dialog>
  )
}
