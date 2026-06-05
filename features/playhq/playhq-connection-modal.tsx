"use client"

import { type ReactNode, useState } from "react"
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { PlayHQConnection } from "./playhq-connection"
import type { PlayHQConnectionFormValues } from "@/lib/schemas/playHQConnectionSchema"
import { useDirectorStore } from "@/store"
import { usePlayHQConnection } from "@/hooks/use-playhq-connection"

interface PlayHQConnectionModalProps {
  children: ReactNode
}

export function PlayHQConnectionModal({ children }: PlayHQConnectionModalProps) {
  const [open, setOpen] = useState(false)
  const { handleConnect } = usePlayHQConnection()

  const onConnect = async (values: PlayHQConnectionFormValues) => {
    const result = await handleConnect(values)
    if (result.success) {
      setOpen(false)
      return { success: true }
    }
    return { success: false, error: result.error }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={children} />
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Connect PlayHQ</DialogTitle>
          <DialogDescription>
            Enter your PlayHQ credentials to connect and retrieve live match data.
          </DialogDescription>
        </DialogHeader>
        <PlayHQConnection
          onConnect={onConnect}
          onCancel={() => setOpen(false)}
          initialValues={{
            tenant: useDirectorStore.getState().playhqTenant ?? undefined,
            organisationId: useDirectorStore.getState().playhqOrganisationId ?? undefined,
          }}
        />
      </DialogContent>
    </Dialog>
  )
}
