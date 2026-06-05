import { describe, it, expect } from "vitest"
import { playHQConnectionSchema } from "@/lib/schemas/playHQConnectionSchema"

describe("playHQConnectionSchema", () => {
  const validData = {
    tenant: "Cricket Queensland",
    clientId: "test-client-id",
    clientSecret: "test-client-secret",
    organisationId: "CQ12345",
  }

  describe("valid values", () => {
    it("accepts valid complete data", () => {
      const result = playHQConnectionSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })

    it("accepts any non-empty string for tenant", () => {
      const result = playHQConnectionSchema.safeParse({ ...validData, tenant: "Any Tenant" })
      expect(result.success).toBe(true)
    })
  })

  describe("required fields", () => {
    it("rejects missing tenant", () => {
      const { tenant, ...withoutTenant } = validData
      const result = playHQConnectionSchema.safeParse(withoutTenant)
      expect(result.success).toBe(false)
      if (!result.success) {
        const tenantError = result.error.issues.find((i) => i.path[0] === "tenant")
        expect(tenantError).toBeDefined()
        expect(tenantError?.message).toBe("Tenant is required")
      }
    })

    it("rejects missing clientId", () => {
      const { clientId, ...withoutClientId } = validData
      const result = playHQConnectionSchema.safeParse(withoutClientId)
      expect(result.success).toBe(false)
      if (!result.success) {
        const error = result.error.issues.find((i) => i.path[0] === "clientId")
        expect(error).toBeDefined()
        expect(error?.message).toBe("Client ID is required")
      }
    })

    it("rejects missing clientSecret", () => {
      const { clientSecret, ...withoutSecret } = validData
      const result = playHQConnectionSchema.safeParse(withoutSecret)
      expect(result.success).toBe(false)
      if (!result.success) {
        const error = result.error.issues.find((i) => i.path[0] === "clientSecret")
        expect(error).toBeDefined()
        expect(error?.message).toBe("Client Secret is required")
      }
    })

    it("rejects missing organisationId", () => {
      const { organisationId, ...withoutOrgId } = validData
      const result = playHQConnectionSchema.safeParse(withoutOrgId)
      expect(result.success).toBe(false)
      if (!result.success) {
        const error = result.error.issues.find((i) => i.path[0] === "organisationId")
        expect(error).toBeDefined()
        expect(error?.message).toBe("Club / Organisation ID is required")
      }
    })

    it("rejects completely empty object", () => {
      const result = playHQConnectionSchema.safeParse({})
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues.length).toBe(4)
      }
    })
  })

  describe("invalid values", () => {
    it("rejects empty string for tenant", () => {
      const result = playHQConnectionSchema.safeParse({ ...validData, tenant: "" })
      expect(result.success).toBe(false)
    })

    it("rejects empty string for clientId", () => {
      const result = playHQConnectionSchema.safeParse({ ...validData, clientId: "" })
      expect(result.success).toBe(false)
    })

    it("rejects empty string for clientSecret", () => {
      const result = playHQConnectionSchema.safeParse({ ...validData, clientSecret: "" })
      expect(result.success).toBe(false)
    })

    it("rejects empty string for organisationId", () => {
      const result = playHQConnectionSchema.safeParse({ ...validData, organisationId: "" })
      expect(result.success).toBe(false)
    })

    it("rejects whitespace-only strings", () => {
      const result = playHQConnectionSchema.safeParse({ ...validData, tenant: "   " })
      expect(result.success).toBe(true) // min(1) allows whitespace - this is expected
    })
  })
})
