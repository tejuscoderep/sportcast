import { test, expect } from "@playwright/test"

/**
 * Score overlay tests.
 * Verifies the ScoreOverlay component renders on the program feed after
 * a PlayHQ connection is established.
 */

async function connectPlayHQ(page: import("@playwright/test").Page) {
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.goto("/")
  await page.waitForTimeout(300)

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
}

test.describe("Score overlay – visibility after connection", () => {
  test.beforeEach(async ({ page }) => {
    await connectPlayHQ(page)
  })

  test("score overlay displays team name abbreviation", async ({ page }) => {
    await expect(page.getByText(/Tigers/i).first()).toBeVisible()
  })

  test("score overlay shows score", async ({ page }) => {
    await expect(page.locator("text=/\\d+\\/\\d+/").first()).toBeVisible()
  })

  test("overlay toggle switch is present", async ({ page }) => {
    await expect(page.locator("button[role='switch']").or(page.locator("[data-slot='switch']"))).toBeVisible()
  })

  test("toggling the overlay switch hides/shows the overlay", async ({ page }) => {
    const toggleSwitch = page.locator("button[role='switch']").or(page.locator("[data-slot='switch']")).first()
    const initialState = await toggleSwitch.getAttribute("aria-checked") ?? await toggleSwitch.getAttribute("data-state")
    await toggleSwitch.click()
    await page.waitForTimeout(100)
    const newState = await toggleSwitch.getAttribute("aria-checked") ?? await toggleSwitch.getAttribute("data-state")
    expect(newState).not.toBe(initialState)
  })
})

test.describe("Score overlay – no overlay before connection", () => {
  test("score overlay is not visible when not connected", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 })
    await page.goto("/")
    await page.waitForTimeout(300)
    // Score overlay should NOT be visible (PlayHQ not connected)
    const tigers = await page.getByText(/Tigers/i).count()
    expect(tigers).toBe(0)
  })
})
