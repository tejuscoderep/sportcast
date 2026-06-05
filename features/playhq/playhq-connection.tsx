"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useState } from "react"
import { playHQConnectionSchema, type PlayHQConnectionFormValues, TENANT_OPTIONS } from "@/lib/schemas/playHQConnectionSchema"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select"
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip"
import { Info, Eye, EyeOff, Loader as Loader2 } from "lucide-react"

interface PlayHQConnectionProps {
  onConnect: (values: PlayHQConnectionFormValues) => Promise<{ success: boolean; error?: string }>
  onCancel?: () => void
  initialValues?: Partial<PlayHQConnectionFormValues>
}

export function PlayHQConnection({ onConnect, onCancel, initialValues }: PlayHQConnectionProps) {
  const [showSecret, setShowSecret] = useState(false)
  const [connecting, setConnecting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<PlayHQConnectionFormValues>({
    resolver: zodResolver(playHQConnectionSchema),
    defaultValues: {
      tenant: initialValues?.tenant ?? "",
      clientId: initialValues?.clientId ?? "",
      clientSecret: initialValues?.clientSecret ?? "",
      organisationId: initialValues?.organisationId ?? "",
    },
  })

  const tenantValue = watch("tenant")

  const onSubmit = async (values: PlayHQConnectionFormValues) => {
    setConnecting(true)
    setError(null)
    try {
      const result = await onConnect(values)
      if (!result.success) {
        setError(result.error ?? "Connection failed")
        setConnecting(false)
      }
    } catch {
      setError("An unexpected error occurred")
      setConnecting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      {/* Tenant */}
      <div className="space-y-1.5">
        <div className="flex items-center gap-1.5">
          <label htmlFor="playhq-tenant" className="text-sm font-medium text-foreground">
            Tenant
          </label>
          <Tooltip>
            <TooltipTrigger render={<button type="button" className="inline-flex" />}>
              <Info className="w-3.5 h-3.5 text-muted-foreground" />
            </TooltipTrigger>
            <TooltipContent>
              Select the governing body or region associated with your PlayHQ account.
            </TooltipContent>
          </Tooltip>
        </div>
        <Select
          value={tenantValue}
          onValueChange={(val) => setValue("tenant", val, { shouldValidate: true })}
        >
          <SelectTrigger id="playhq-tenant" className="w-full" disabled={connecting}>
            <SelectValue placeholder="Select Sport/Region" />
          </SelectTrigger>
          <SelectContent>
            {TENANT_OPTIONS.map((opt) => (
              <SelectItem key={opt} value={opt}>
                {opt}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.tenant && (
          <p className="text-xs text-destructive" role="alert">{errors.tenant.message}</p>
        )}
      </div>

      {/* Client ID */}
      <div className="space-y-1.5">
        <div className="flex items-center gap-1.5">
          <label htmlFor="playhq-client-id" className="text-sm font-medium text-foreground">
            Client ID
          </label>
          <Tooltip>
            <TooltipTrigger render={<button type="button" className="inline-flex" />}>
              <Info className="w-3.5 h-3.5 text-muted-foreground" />
            </TooltipTrigger>
            <TooltipContent>
              Found in PlayHQ API credentials configuration.
            </TooltipContent>
          </Tooltip>
        </div>
        <Input
          id="playhq-client-id"
          placeholder="Your PlayHQ Client ID"
          disabled={connecting}
          {...register("clientId")}
        />
        {errors.clientId && (
          <p className="text-xs text-destructive" role="alert">{errors.clientId.message}</p>
        )}
      </div>

      {/* Client Secret */}
      <div className="space-y-1.5">
        <div className="flex items-center gap-1.5">
          <label htmlFor="playhq-client-secret" className="text-sm font-medium text-foreground">
            Client Secret
          </label>
          <Tooltip>
            <TooltipTrigger render={<button type="button" className="inline-flex" />}>
              <Info className="w-3.5 h-3.5 text-muted-foreground" />
            </TooltipTrigger>
            <TooltipContent>
              Found alongside Client ID in PlayHQ API credentials.
            </TooltipContent>
          </Tooltip>
        </div>
        <div className="relative">
          <Input
            id="playhq-client-secret"
            type={showSecret ? "text" : "password"}
            placeholder="Your PlayHQ Client Secret"
            disabled={connecting}
            {...register("clientSecret")}
          />
          <button
            type="button"
            className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            onClick={() => setShowSecret(!showSecret)}
            aria-label={showSecret ? "Hide client secret" : "Show client secret"}
            disabled={connecting}
          >
            {showSecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
        {errors.clientSecret && (
          <p className="text-xs text-destructive" role="alert">{errors.clientSecret.message}</p>
        )}
      </div>

      {/* Club / Organisation ID */}
      <div className="space-y-1.5">
        <div className="flex items-center gap-1.5">
          <label htmlFor="playhq-org-id" className="text-sm font-medium text-foreground">
            Club / Organisation ID
          </label>
          <Tooltip>
            <TooltipTrigger render={<button type="button" className="inline-flex" />}>
              <Info className="w-3.5 h-3.5 text-muted-foreground" />
            </TooltipTrigger>
            <TooltipContent>
              The unique identifier of your club or organisation within PlayHQ.
            </TooltipContent>
          </Tooltip>
        </div>
        <Input
          id="playhq-org-id"
          placeholder="e.g. CQ12345"
          disabled={connecting}
          {...register("organisationId")}
        />
        {errors.organisationId && (
          <p className="text-xs text-destructive" role="alert">{errors.organisationId.message}</p>
        )}
      </div>

      {/* Error message */}
      {error && (
        <p className="text-sm text-destructive" role="alert">{error}</p>
      )}

      {/* Loading message */}
      {connecting && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="w-4 h-4 animate-spin" />
          Establishing connection...
        </div>
      )}

      {/* Footer buttons */}
      <div className="flex justify-end gap-2 pt-2">
        {onCancel && (
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={connecting}
          >
            Cancel
          </Button>
        )}
        <Button type="submit" disabled={connecting}>
          {connecting ? "Connecting..." : "Connect"}
        </Button>
      </div>
    </form>
  )
}
