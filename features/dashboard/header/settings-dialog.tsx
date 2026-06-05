"use client"

import { useState, useEffect, type ReactNode } from "react"
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { PlayHQConnection } from "@/features/playhq"
import { usePlayHQConnection } from "@/hooks/use-playhq-connection"
import type { PlayHQConnectionFormValues } from "@/lib/schemas/playHQConnectionSchema"
import { useDirectorStore } from "@/store"

interface IntegrationFields {
  youtubeStreamKey: string
  youtubeClientId: string
  facebookStreamKey: string
  facebookAppId: string
}

const STORAGE_KEY = "sportcast-integrations"

const DEFAULT_FIELDS: IntegrationFields = {
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
  const connectionStatus = useDirectorStore((s) => s.playhqConnectionStatus)
  const tenant = useDirectorStore((s) => s.playhqTenant)
  const orgId = useDirectorStore((s) => s.playhqOrganisationId)
  const { handleConnect } = usePlayHQConnection()

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

  const onPlayHQConnect = async (values: PlayHQConnectionFormValues) => {
    const result = await handleConnect(values)
    if (result.success) {
      return { success: true }
    }
    return { success: false, error: result.error }
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
          {/* PlayHQ - reusable component */}
          <div className="space-y-2.5">
            <p className="text-sm font-medium text-foreground">PlayHQ Integration</p>
            {connectionStatus === "connected" ? (
              <div className="flex items-center gap-2 text-sm text-emerald-400">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                Connected to {tenant}
              </div>
            ) : (
              <PlayHQConnection
                onConnect={onPlayHQConnect}
                onCancel={() => setOpen(false)}
                initialValues={{
                  tenant: tenant ?? undefined,
                  organisationId: orgId ?? undefined,
                }}
              />
            )}
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

        {connectionStatus === "connected" && (
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Close
            </Button>
            <Button onClick={handleSave}>Save</Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
