import { z } from "zod"

export const TENANT_OPTIONS = [
  "Cricket Australia",
  "Cricket Queensland",
  "AFL Queensland",
  "Netball Queensland",
  "Basketball Queensland",
] as const

export type TenantOption = (typeof TENANT_OPTIONS)[number]

export const playHQConnectionSchema = z.object({
  tenant: z.string({ error: "Tenant is required" }).min(1, "Tenant is required"),
  clientId: z.string({ error: "Client ID is required" }).min(1, "Client ID is required"),
  clientSecret: z.string({ error: "Client Secret is required" }).min(1, "Client Secret is required"),
  organisationId: z.string({ error: "Club / Organisation ID is required" }).min(1, "Club / Organisation ID is required"),
})

export type PlayHQConnectionFormValues = z.infer<typeof playHQConnectionSchema>
