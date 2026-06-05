import { test, expect, type Page } from "@playwright/test"

/**
 * Dashboard layout tests.
 * Verifies the director dashboard renders correctly and the three-panel
 * desktop layout (match info | program feed | camera management) is present.
 */

test.describe("Dashboard – layout", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/")
  })

  test("renders SportCast header", async ({ page }) => {
    await expect(page.getByText("SportCast")).toBeVisible()
  })

  test("shows Director Dashboard badge", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 })
    await page.reload()
    await expect(page.getByText("Director Dashboard")).toBeVisible()
  })

  test("shows all three desktop panels on wide viewport", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 })
    await page.reload()

    // Left panel – PlayHQ Live
    await expect(page.getByText("PlayHQ")).toBeVisible()

    // Center panel – program feed
    await expect(page.getByText("PREVIEW").or(page.getByText("No camera selected"))).toBeVisible()

    // Right panel – camera management
    await expect(page.getByText("Cameras")).toBeVisible()
  })

  test("shows broadcast controls at the bottom", async ({ page }) => {
    await expect(page.getByRole("button", { name: /Go Live|Start Broadcast/i })).toBeVisible()
  })

  test("shows OFFLINE badge before broadcast starts", async ({ page }) => {
    await expect(page.getByText("OFFLINE")).toBeVisible()
  })
})

test.describe("Dashboard – PlayHQ panel", () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 })
    await page.goto("/")
    await page.waitForTimeout(300)
  })

  test("shows Not Connected status initially", async ({ page }) => {
    await expect(page.getByText("Not Connected")).toBeVisible()
  })

  test("shows Connect button initially", async ({ page }) => {
    await expect(page.getByRole("button", { name: /^Connect$/i })).toBeVisible()
  })

  test("clicking Connect opens PlayHQ connection modal", async ({ page }) => {
    await page.getByRole("button", { name: /^Connect$/i }).click()
    await expect(page.getByText("Connect PlayHQ")).toBeVisible()
    await expect(page.getByText("Tenant")).toBeVisible()
  })

  test("Connect modal has all required form fields", async ({ page }) => {
    await page.getByRole("button", { name: /^Connect$/i }).click()
    await expect(page.getByText("Tenant")).toBeVisible()
    await expect(page.getByLabel("Client ID")).toBeVisible()
    await expect(page.getByLabel("Client Secret")).toBeVisible()
    await expect(page.getByLabel(/Club.*Organisation ID/i)).toBeVisible()
  })

  test("Connect modal shows validation errors on empty submit", async ({ page }) => {
    await page.getByRole("button", { name: /^Connect$/i }).click()
    // Click Connect in modal (second Connect button in the form)
    const modalConnectBtns = page.getByRole("button", { name: /^Connect$/i })
    const formConnectBtn = modalConnectBtns.last()
    await formConnectBtn.click()
    await page.waitForTimeout(300)
    // Validation errors should appear
    await expect(page.getByText("Tenant is required")).toBeVisible()
  })

  test("successful connection shows Connected status", async ({ page }) => {
    await page.getByRole("button", { name: /^Connect$/i }).click()

    // Fill the form
    // Select tenant
    const tenantSelect = page.locator("#playhq-tenant").or(page.getByRole("combobox").first())
    await tenantSelect.click()
    await page.getByText("Cricket Queensland").click()

    // Fill other fields
    await page.getByLabel("Client ID").fill("test-client-id")
    await page.getByLabel("Client Secret").fill("test-client-secret")
    await page.getByLabel(/Club.*Organisation ID/i).fill("CQ12345")

    // Click Connect in the form
    const modalConnectBtns = page.getByRole("button", { name: /^Connect$/i })
    const formConnectBtn = modalConnectBtns.last()
    await formConnectBtn.click()

    // Wait for connection (1-2 second simulated latency)
    await page.waitForTimeout(2500)

    // Should show Connected status
    await expect(page.getByText("Connected").first()).toBeVisible()
  })

  test("connected state shows Live Match dropdown", async ({ page }) => {
    // Connect first
    await page.getByRole("button", { name: /^Connect$/i }).click()
    const tenantSelect = page.locator("#playhq-tenant").or(page.getByRole("combobox").first())
    await tenantSelect.click()
    await page.getByText("Cricket Queensland").click()
    await page.getByLabel("Client ID").fill("test-client-id")
    await page.getByLabel("Client Secret").fill("test-client-secret")
    await page.getByLabel(/Club.*Organisation ID/i).fill("CQ12345")
    const modalConnectBtns = page.getByRole("button", { name: /^Connect$/i })
    await modalConnectBtns.last().click()
    await page.waitForTimeout(2500)

    // Should show Live Match label and match dropdown
    await expect(page.getByText("Live Match")).toBeVisible()
    await expect(page.getByText("Brisbane Tigers vs Gold Coast Sharks")).toBeVisible()
  })

  test("connected state shows scorecard", async ({ page }) => {
    // Connect first
    await page.getByRole("button", { name: /^Connect$/i }).click()
    const tenantSelect = page.locator("#playhq-tenant").or(page.getByRole("combobox").first())
    await tenantSelect.click()
    await page.getByText("Cricket Queensland").click()
    await page.getByLabel("Client ID").fill("test-client-id")
    await page.getByLabel("Client Secret").fill("test-client-secret")
    await page.getByLabel(/Club.*Organisation ID/i).fill("CQ12345")
    const modalConnectBtns = page.getByRole("button", { name: /^Connect$/i })
    await modalConnectBtns.last().click()
    await page.waitForTimeout(2500)

    // Scorecard should be visible
    await expect(page.getByText("Brisbane Tigers")).toBeVisible()
    await expect(page.getByText("Gold Coast Sharks")).toBeVisible()
  })
})

test.describe("Dashboard – camera panel", () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 })
    await page.goto("/")
    await page.waitForTimeout(300)
  })

  test("shows one demo camera by default", async ({ page }) => {
    await expect(page.getByText("Camera 1 - Main Pitch")).toBeVisible()
  })

  test("shows Add Camera button", async ({ page }) => {
    await expect(page.getByRole("button", { name: /Add Camera/i })).toBeVisible()
  })

  test("first camera shows ON AIR by default", async ({ page }) => {
    await expect(page.getByText("ON AIR")).toBeVisible()
  })

  test("clicking Add Camera adds a new camera", async ({ page }) => {
    await page.getByRole("button", { name: /Add Camera/i }).click()
    await page.waitForTimeout(100)
    await expect(page.getByText("Camera 2")).toBeVisible()
  })

  test("camera card shows battery percentage", async ({ page }) => {
    await expect(page.getByText(/\d+%/).first()).toBeVisible()
  })

  test("camera card shows signal percentage", async ({ page }) => {
    const percentages = page.getByText(/\d+%/)
    await expect(percentages.first()).toBeVisible()
  })
})

test.describe("Dashboard – broadcast controls", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/")
  })

  test("Go Live button is visible and enabled", async ({ page }) => {
    const btn = page.getByRole("button", { name: /Go Live|Start Broadcast/i })
    await expect(btn).toBeVisible()
    await expect(btn).toBeEnabled()
  })

  test("clicking Go Live transitions to LIVE state", async ({ page }) => {
    const btn = page.getByRole("button", { name: /Go Live|Start Broadcast/i })
    await btn.click()
    await page.waitForTimeout(1500)
    await expect(page.getByText("LIVE").first()).toBeVisible()
  })

  test("after going live, Stop Stream button appears", async ({ page }) => {
    await page.getByRole("button", { name: /Go Live|Start Broadcast/i }).click()
    await page.waitForTimeout(1500)
    await expect(page.getByRole("button", { name: /Stop|Stop Stream/i })).toBeVisible()
  })

  test("clicking Stop Stream returns to OFFLINE state", async ({ page }) => {
    await page.getByRole("button", { name: /Go Live|Start Broadcast/i }).click()
    await page.waitForTimeout(1500)
    await page.getByRole("button", { name: /Stop|Stop Stream/i }).click()
    await page.waitForTimeout(1000)
    await expect(page.getByText("OFFLINE")).toBeVisible()
  })

  test("shows platform labels YouTube and Facebook", async ({ page }) => {
    await expect(page.getByText("YouTube")).toBeVisible()
    await expect(page.getByText("Facebook")).toBeVisible()
  })

  test("shows bitrate in stream health stats", async ({ page }) => {
    await expect(page.getByText(/Bitrate/i)).toBeVisible()
  })
})

test.describe("Dashboard – mobile layout", () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 })
    await page.goto("/")
    await page.waitForTimeout(200)
  })

  test("shows program feed on mobile", async ({ page }) => {
    await expect(page.locator("video, [data-testid='program-feed']").or(page.getByText(/No camera selected|PREVIEW/i))).toBeVisible()
  })

  test("shows PlayHQ panel on mobile", async ({ page }) => {
    await expect(page.getByText("PlayHQ").first()).toBeVisible()
  })

  test("shows broadcast controls on mobile", async ({ page }) => {
    await expect(page.getByRole("button", { name: /Go Live|Start Broadcast/i })).toBeVisible()
  })
})
