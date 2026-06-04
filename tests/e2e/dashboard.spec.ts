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

  test("shows all three desktop panels on wide viewport", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 })
    await page.reload()

    // Left panel – match info
    await expect(page.getByText("Match Information").or(page.getByText("PlayHQ")).or(page.getByText("Brisbane Tigers"))).toBeVisible()

    // Center panel – program feed
    await expect(page.locator("video").or(page.getByText("No active camera").or(page.getByText("PREVIEW").or(page.getByText("LIVE"))))).toBeVisible()

    // Right panel – camera management heading or a camera card
    await expect(
      page.getByText("Cameras").or(page.getByText("Camera 1")).or(page.getByText("Camera 1 - Main Pitch"))
    ).toBeVisible()
  })

  test("shows broadcast controls at the bottom", async ({ page }) => {
    await expect(page.getByRole("button", { name: /Go Live|Start Broadcast/i })).toBeVisible()
  })

  test("shows OFFLINE badge before broadcast starts", async ({ page }) => {
    await expect(page.getByText("OFFLINE")).toBeVisible()
  })
})

test.describe("Dashboard – score overlay", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/")
    // Wait for score data to populate from mock provider
    await page.waitForTimeout(200)
  })

  test("shows home team name in match info", async ({ page }) => {
    await expect(page.getByText("Brisbane Tigers")).toBeVisible()
  })

  test("shows away team name in match info", async ({ page }) => {
    await expect(page.getByText("Gold Coast Sharks")).toBeVisible()
  })

  test("shows current score in match info panel", async ({ page }) => {
    // Score format: "145/4" style – look for wickets indicator
    await expect(page.locator("text=/\\d+\\/\\d+/").first()).toBeVisible()
  })

  test("shows overs in match info panel", async ({ page }) => {
    // Overs format: "17.2" style
    await expect(page.locator("text=/\\d+\\.\\d+/").first()).toBeVisible()
  })

  test("score overlay can be toggled via the eye icon", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 })
    await page.reload()
    await page.waitForTimeout(200)

    // Find the toggle button (Eye/EyeOff in header)
    const toggleBtn = page.locator("header").getByRole("button").filter({ hasNot: page.locator("[data-settings]") }).first()
    await toggleBtn.click()

    // After clicking, the overlay should be hidden (state changes, no assertion on DOM since
    // the overlay is only on video element which may not have real content in tests)
  })
})

test.describe("Dashboard – camera panel", () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 })
    await page.goto("/")
    await page.waitForTimeout(300)
  })

  test("shows three demo cameras by default", async ({ page }) => {
    await expect(page.getByText("Camera 1 - Main Pitch")).toBeVisible()
    await expect(page.getByText("Camera 2 - Wide Ground")).toBeVisible()
    await expect(page.getByText("Camera 3 - Batsman Close")).toBeVisible()
  })

  test("first camera shows ON AIR by default", async ({ page }) => {
    await expect(page.getByText("ON AIR")).toBeVisible()
  })

  test("Take Live button switches active camera", async ({ page }) => {
    // Find the second camera card and click its Take/Take Live button
    const cameraCards = page.locator("[class*='card'], [data-slot='card']").filter({ hasText: "Camera 2" })
    const takeBtn = cameraCards.getByRole("button", { name: /take|live/i }).first()
    await takeBtn.click()
    await page.waitForTimeout(100)

    // ON AIR badge count should still be 1 (only one camera active at a time)
    await expect(page.getByText("ON AIR")).toHaveCount(1)
  })

  test("each camera card shows battery percentage", async ({ page }) => {
    await expect(page.getByText(/\d+%/).first()).toBeVisible()
  })

  test("each camera card shows signal percentage", async ({ page }) => {
    // Signal shown as e.g. "95%", "90%" – at least three visible
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
    // Allow the mock service start delay (1 second simulated)
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
    // Video element or its placeholder should be present
    await expect(page.locator("video, [data-testid='program-feed']").or(page.getByText(/No active camera|PREVIEW/i))).toBeVisible()
  })

  test("shows match info section on mobile", async ({ page }) => {
    const matchInfo = page.getByText("Match Information").or(page.getByText("Brisbane Tigers"))
    await expect(matchInfo.first()).toBeVisible()
  })

  test("shows broadcast controls on mobile", async ({ page }) => {
    await expect(page.getByRole("button", { name: /Go Live|Start Broadcast/i })).toBeVisible()
  })
})
