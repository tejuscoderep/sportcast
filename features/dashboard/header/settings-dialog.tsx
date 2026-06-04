"use client"

import { useState, useEffect, type ReactNode } from "react"
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"

interface IntegrationFields {
  playhqApiUrl: string
  playhqApiKey: string
  youtubeStreamKey: string
  youtubeClientId: string
  facebookStreamKey: string
  facebookAppId: string
}

const STORAGE_KEY = "sportcast-integrations"

const DEFAULT_FIELDS: IntegrationFields = {
  playhqApiUrl: "",
  playhqApiKey: "",
  youtubeStreamKey: "",
  youtubeClientId: "",
  facebookStreamKey: "",
  facebookAppId: "",
}

function loadFields(): IntegrationFields {
  if (typeof window === "undefined") return DEFAULT_FIELDS
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored ? { ...DEFAULT_FIELDS, ...JSON.parse(stored) } : DEFAULT_FIELDS
  } catch {
    return DEFAULT_FIELDS
  }
}

function saveFields(fields: IntegrationFields) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(fields))
}

export function SettingsDialog({ children }: { children: ReactNode }) {
  const [fields, setFields] = useState<IntegrationFields>(DEFAULT_FIELDS)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (open) setFields(loadFields())
  }, [open])

  const updateField = (key: keyof IntegrationFields, value: string) => {
    setFields((prev) => ({ ...prev, [key]: value }))
  }

  const handleSave = () => {
    saveFields(fields)
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={children} />
      <DialogContent className="sm:max-w-md max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
          <DialogDescription>
            Configure your streaming platform integrations. Values are stored locally in your browser.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* PlayHQ */}
          <div className="space-y-2.5">
            <p className="text-sm font-medium text-foreground">PlayHQ Integration</p>
            <div>
              <label className="text-xs text-muted-foreground block mb-1">API URL</label>
              <Input
                placeholder="https://api.playhq.com"
                value={fields.playhqApiUrl}
                onChange={(e) => updateField("playhqApiUrl", e.target.value)}
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground block mb-1">API Key</label>
              <Input
                type="password"
                placeholder="Your PlayHQ API key"
                value={fields.playhqApiKey}
                onChange={(e) => updateField("playhqApiKey", e.target.value)}
              />
            </div>
          </div>

          <Separator />

          {/* YouTube */}
          <div className="space-y-2.5">
            <p className="text-sm font-medium text-foreground">YouTube Live</p>
            <div>
              <label className="text-xs text-muted-foreground block mb-1">Stream Key</label>
              <Input
                type="password"
                placeholder="xxxx-xxxx-xxxx-xxxx"
                value={fields.youtubeStreamKey}
                onChange={(e) => updateField("youtubeStreamKey", e.target.value)}
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground block mb-1">Client ID</label>
              <Input
                placeholder="Your YouTube OAuth Client ID"
                value={fields.youtubeClientId}
                onChange={(e) => updateField("youtubeClientId", e.target.value)}
              />
            </div>
          </div>

          <Separator />

          {/* Facebook */}
          <div className="space-y-2.5">
            <p className="text-sm font-medium text-foreground">Facebook Live</p>
            <div>
              <label className="text-xs text-muted-foreground block mb-1">Stream Key</label>
              <Input
                type="password"
                placeholder="Your Facebook stream key"
                value={fields.facebookStreamKey}
                onChange={(e) => updateField("facebookStreamKey", e.target.value)}
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground block mb-1">App ID</label>
              <Input
                placeholder="Your Facebook App ID"
                value={fields.facebookAppId}
                onChange={(e) => updateField("facebookAppId", e.target.value)}
              />
            </div>
          </div>
        </div>

        <DialogFooter showCloseButton={false}>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
